import { ProjectId } from 'gitlab';
import { MergeRequestEvent } from '../interfaces/MergeRequestEvent';
import { User } from '../interfaces/User';
import { NoteEvent } from '../interfaces/NoteEvent';
import { RepoBlob } from '../interfaces/RepoBlob';
import { Collaborators } from './Collaborators';
import { MergeRequest } from '../interfaces/MergeRequest';
import { botInfo, gitlabApi, ownersFileName } from '../Entrypoint';
import * as YAML from 'yaml'
import { MergeRequestParticipants } from './MergeRequestParticipants';
import { GitlabUsersDecorator } from '../gitlab/GitlabUsersDecorator';
import { Blunderbuss } from './Blunderbuss';

export async function handleNoteEvent(noteEvt: NoteEvent) {
  const { note } = noteEvt.object_attributes;
  // Prevent bot's command execution
  if (noteEvt.user.username === botInfo.username) {
    return;
  }
  if (note.includes('/test')) {
    // TODO Handle WIP request
    const { approvers, reviewers } = await getCollaborators(noteEvt.project_id);
    if (!(approvers.includes(noteEvt.user.username) || reviewers.includes(noteEvt.user.username)))
      return;
    handleTestEvent(noteEvt.merge_request, noteEvt.project_id);
    reply(noteEvt.project_id,
      noteEvt.merge_request.iid,
      `@${noteEvt.user.username}, 
      your requst for tests has been submitted! 
      I will post test results once they are ready.`);
  }

  if (note.includes('/lgtm')) {
    // TODO Handle WIP request
    const participants = new MergeRequestParticipants(
      gitlabApi.Snippets,
      noteEvt.project_id,
      noteEvt.merge_request.iid)

    const { reviewers, lgtmers } = await participants.get()

    if (!reviewers.includes(noteEvt.user.username))
      return;

    const labels = await gitlabApi.MergeRequests
      .show(noteEvt.project_id, noteEvt.merge_request.iid)
      .then(mr => (<MergeRequest>mr).labels);
    gitlabApi.MergeRequests
      .edit(noteEvt.project_id, noteEvt.merge_request.iid,
        { labels: labels.concat("lgtm").join(",") });


    if (lgtmers.includes(noteEvt.user.username))
      return

    lgtmers.push(noteEvt.user.username)
    participants.set({ lgtmers })
  }

  if (note.includes('/unlgtm')) {
    const participants = new MergeRequestParticipants(
      gitlabApi.Snippets,
      noteEvt.project_id,
      noteEvt.merge_request.iid)

    let { lgtmers } = await participants.get()

    if (!lgtmers.includes(noteEvt.user.username))
      return

    const lgtmerIndex = lgtmers.indexOf(noteEvt.user.username)
    lgtmers.splice(lgtmerIndex, 1)

    participants.set({ lgtmers: lgtmers })

    if (lgtmers.length !== 0)
      return

    let labels = await gitlabApi.MergeRequests
      .show(noteEvt.project_id, noteEvt.merge_request.iid)
      .then(mr => (<MergeRequest>mr).labels);

    const labelIndex = lgtmers.indexOf("lgtm")
    labels.splice(labelIndex, 1)

    gitlabApi.MergeRequests
      .edit(noteEvt.project_id, noteEvt.merge_request.iid,
        { labels: labels.join(",") });

  }

  if (note.includes('/approve')) {
    const users = await gitlabApi.Users.all().then(_ => (<User[]>_));
    const userId = users.find(u => u.username === noteEvt.user.username).id;
    if (userId === noteEvt.merge_request.assignee_id)
      // TODO Update weight maps once MR is closed
      // TODO Handle rebasing
      // https://docs.gitlab.com/ee/api/merge_requests.html#rebase-a-merge-request
      gitlabApi.MergeRequests.accept(noteEvt.project_id, noteEvt.merge_request.iid)
        .catch(e => console.log(e));
  }
  if (note.includes('/ready-for-review')) {
    if (noteEvt.object_attributes.author_id === noteEvt.merge_request.author_id)
      handleReadyForReviewEvent(noteEvt);
  }
  if (note.includes('/meow')) {
    // Use https://api.thecatapi.com/v1/images/search?format=json&results_per_page=1 for better caturday api
    gitlabApi.MergeRequestNotes.create(noteEvt.project_id, noteEvt.merge_request.iid, "![cat](https://cataas.com/cat)");
  }
}
async function handleReadyForReviewEvent(evt: NoteEvent) {
  const users = new GitlabUsersDecorator(gitlabApi.Users, gitlabApi.Snippets);
  const blunderbuss = new Blunderbuss(users, evt.project_id, evt.merge_request, gitlabApi.RepositoryFiles)
  const author = await blunderbuss.getAuthor()
  const assignee = await blunderbuss.selectApprover()
  const reviewers = await blunderbuss.selectReviewers()

  const messageForReviewers = [
    "The following table represents the participants of this MR",
    "", "Name | Role", "---|---",
    `@${author.username} | Author`,
    `@${assignee.username} | Approver`,
    ...reviewers.map(r => `@${r.username} | Reviewer`), "",
    "Reviewers can accept the MR using `/lgtm` command. Approver can merge the MR using `/approve`."
  ];

  // Resolve WIP statas and Assign the merge request approver 
  gitlabApi.MergeRequests.edit(
    evt.project_id, evt.merge_request.iid,
    { title: evt.merge_request.title.replace('WIP: ', ''), assignee_id: assignee.id }
  );

  // Keep reviewer collection in persistent storage
  const mrRevs = new MergeRequestParticipants(gitlabApi.Snippets, evt.project_id, evt.merge_request.iid)
  mrRevs.set({ reviewers: reviewers.map(u => u.username) })

  // Update weight maps once reviewers are assigned
  gitlabApi.MergeRequests.show(evt.project_id, evt.merge_request.iid).then(mr => {
    const changes_count = parseInt((<MergeRequest>mr).changes_count);
    reviewers.forEach(r => users.increaseWeight({ name: r.username, weight: changes_count }));
  });

  // Comment to thread with Merge Request participants table
  reply(evt.project_id, evt.merge_request.iid, messageForReviewers.join('\n'));
}

function handleTestEvent(merge_request: any, project_id: ProjectId) {
  const variables = [
    { "key": "MR_ID", "value": merge_request.iid.toString() },
    { "key": "MR_REF", "value": merge_request.source_branch }
  ];
  gitlabApi.Pipelines.create(project_id, merge_request.target_branch, {
    variables
  }).catch(err => console.log(err));
}
export function handlePipelineEvent(pipeline) {
  const projectId = pipeline.project.id;
  const status = pipeline.object_attributes.detailed_status;
  const MR_ID = parseInt(pipeline.object_attributes.variables.find(v => v.key === "MR_ID").value);
  const jobID = pipeline.builds.find(b => b.name === "Code Quality").id;
  const reportUrl = generateReportURL(pipeline.project.web_url, jobID);
  if (status === "passed")
    reply(projectId, MR_ID, generateReportSummary(reportUrl));
}
function generateReportURL(projectURL: string, jobID: number | string) {
  return projectURL + '/-/jobs/' + jobID + "/artifacts/raw/gl-code-quality-report.html?inline=false";
}
function generateReportSummary(reportURL: string) {
  return `
The following table represents several test results, say \`/test\` to start them over: 

Test Name | Status | Details 
---|:---:|--- 
Code Quality | :white_check_mark: | [Link](${reportURL}) 
Unit Tests | :warning: | N/A 
Code Coverage | :no_entry: | Link 
  `;
}

export function handleMergeRequestEvent(mrEvt: MergeRequestEvent) {
  if (mrEvt.object_attributes.action === "open")
    reply(mrEvt.project.id, mrEvt.object_attributes.iid, generateWelcomeMessage(mrEvt.user));
  if (mrEvt.object_attributes.action === "merge" || mrEvt.object_attributes.action === "close") {
    // Update weight maps once reviewers are assigned
    gitlabApi.MergeRequests.show(mrEvt.project.id, mrEvt.object_attributes.iid).then(async mr => {
      const users = new GitlabUsersDecorator(gitlabApi.Users, gitlabApi.Snippets);
      const changes_count = parseInt((<MergeRequest>mr).changes_count);
      const participants = await new MergeRequestParticipants(gitlabApi.Snippets, mrEvt.project.id, mrEvt.object_attributes.iid).get()
      participants["reviewers"].forEach(r => users.decreaseWeight({ name: r, weight: changes_count }));
    }).catch(err => console.log(err));
    // TODO dispose reviewers persistent state 
  }
}

function generateWelcomeMessage(user: User) {
  return `
    Hi @${user.username}! Thanks for your MR.
    Once your changes are ready to be merged type \`/ready-for-review\` so that I can assign reviewers.
  `;
}

function getCollaborators(project_id: number | string): Promise<Collaborators> {
  return gitlabApi.RepositoryFiles.show(project_id, ownersFileName, 'master')
    .then(_ => {
      return YAML.parse(Buffer.from((<RepoBlob>_).content, "base64").toString("ascii"));
    });
}

function reply(projectId: ProjectId, mrId: any, text: string) {
  gitlabApi.MergeRequestNotes.create(projectId, mrId, text).catch(err => console.log(err));
}
