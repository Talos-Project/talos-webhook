import { ProjectId } from 'gitlab';
import { MergeRequestEvent } from './MergeRequestEvent';
import { User } from './User';
import { NoteEvent } from './NoteEvent';
import { RepoBlob } from './RepoBlob';
import { Collaborators } from './Collaborators';
import { MergeRequest } from './MergeRequest';
import { GitlabReviewers } from './GitlabReviewers';
import { botInfo, gitlabApi, ownersFileName } from './Entrypoint';
import * as YAML from 'yaml'
import { MergeRequestReveiwers } from './MergeRequestReviewers';

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
    reply(noteEvt.project_id, noteEvt.merge_request.iid, `@${noteEvt.user.username}, your requst for tests has been submitted! I will post test results once they are ready.`);
  }
  if (note.includes('/lgtm')) {
    // TODO Handle WIP request
    // FIXME Get reviewers from MR
    const { approvers, reviewers } = await getCollaborators(noteEvt.project_id);
    if (!(approvers.includes(noteEvt.user.username) || reviewers.includes(noteEvt.user.username)))
      return;
    const labels = await gitlabApi.MergeRequests.show(noteEvt.project_id, noteEvt.merge_request.iid).then(mr => (<MergeRequest>mr).labels);
    gitlabApi.MergeRequests.edit(noteEvt.project_id, noteEvt.merge_request.iid, { labels: labels.join(",").concat(",lgtm") });
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
    handleReadyForReviewEvent(noteEvt);
  }
  if (note.includes('/meow')) {
    // Use https://api.thecatapi.com/v1/images/search?format=json&results_per_page=1 for better caturday api
    gitlabApi.MergeRequestNotes.create(noteEvt.project_id, noteEvt.merge_request.iid, "![cat](https://cataas.com/cat)");
  }
}
async function handleReadyForReviewEvent(evt: NoteEvent) {
  // TODO Move Blunderbuss selection to a function
  // and invoke that function if only assignee is not assigned
  const gReviewers = new GitlabReviewers(gitlabApi.Snippets);
  const owners = await getCollaborators(evt.project_id);
  const users = await gitlabApi.Users.all().then(_ => (<User[]>_));
  const author = users.find(u => evt.merge_request.author_id === u.id).username;
  const potentialApprovers = users.filter(u => owners.approvers.includes(u.username))
    .filter(u => u.id !== evt.merge_request.author_id).map(r => r.username);
  const assignee = users.find(u => u.username === potentialApprovers[Math.floor(Math.random() * potentialApprovers.length)]);
  const potentialReviewers = users.filter(u => owners.reviewers.includes(u.username))
    .filter(u => u.id !== evt.merge_request.author_id).map(r => r.username);
  const ReviewersWeigthMaps = await gReviewers.getAll();
  const zeroWeightRevs = potentialReviewers
    .filter(r => !ReviewersWeigthMaps.map(wm => wm.name).includes(r));
  // Updating current state of reviewers weightmap with new users from owners file
  zeroWeightRevs.forEach(r => gReviewers.update({ name: r, weight: 0 }));
  const reviewers = (await gReviewers.getAll())
    .filter(wm => potentialReviewers.includes(wm.name))
    .sort((a, b) => a.weight - b.weight).map(r => r.name).slice(0, 2);
  gitlabApi.MergeRequests.edit(evt.project_id, evt.merge_request.iid, { assignee_id: assignee.id });
  const messageForReviewers = [
    "The following table represents the participants of this MR",
    "", "Name | Role", "---|---",
    `@${author} | Author`,
    `@${assignee.username} | Approver`,
    ...reviewers.map(r => `@${r} | Reviewer`), "",
    "Reviewers can accept the MR using `/lgtm` command. Approver can merge the MR using `/approve`."
  ];
  const mrRevs = new MergeRequestReveiwers(gitlabApi.Snippets, evt.project_id, evt.merge_request.iid)
  mrRevs.set(reviewers)
  // TODO Update weight maps once reviewers are assigned
  gitlabApi.MergeRequests.show(evt.project_id, evt.merge_request.iid).then(mr => {
    const changes_count = parseInt((<MergeRequest>mr).changes_count);
    reviewers.forEach(r => gReviewers.increaseWeight({ name: r, weight: changes_count }));
  });
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
// TODO: Extract requestReport to an interface so that you can have diffirent types of reports (code quality, coverage, etc.) 
// TODO: Get all artifacts from jobs with stage test 
// TODO: Unzip json reports from artifacts and append them to merge request discussion 
// TODO: Attach commit hash to artifacts 
// TODO: Let users choose the type (code quality) and format (html,json) of report 
// TODO: Expose report name as function argument 
// TODO: Extract artifact path from pipeline variable 
export function handleWelcomeEvent(mr: MergeRequestEvent) {
  if (mr.object_attributes.action === "open")
    reply(mr.project.id, mr.object_attributes.iid, generateWelcomeMessage(mr.user));
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
