import * as express from 'express'
import * as bodyparser from 'body-parser'
import { Gitlab, ProjectId, Branches } from 'gitlab'
// import { request } from 'https'

require("dotenv").config();

const gitlabApi = new Gitlab({
  host: process.env.host,
  token: process.env.token
});

// gitlabApi.Repositories.show
// gitlabApi.Users.current().then(val => console.log(val))
// gitlabApi.Users.all().then(_ => console.log(_))
// gitlabApi.Pipelines.show(528, 3721).then(_ => console.log(_))
// gitlabApi.MergeRequests.all({projectId: 528, state: "opened", source_branch: "feature-x"}).then(_ => console.log(_))
// gitlabApi.Pipelines.create(528, "1-df", { "variables": [{ "key": "MR_ID", "value": "24"}] }).then(_ => { console.log(_) }).catch(err => console.log(err))

const PORT = process.env.NODE_PORT || 3000;
const app = express();
const api = express.Router();

api.post("/hook", (req, res) => {
  const { project_id, object_kind, object_attributes, builds, merge_request, ref } = req.body;
  console.log(req.body);

  switch (object_kind) {
    case "note":
      handleNoteEvent(object_attributes, project_id, merge_request);
      break;
    case "build":
      handleBuildEvent(project_id, ref);
      console.log(req.body)
    default:
      // console.log(object_kind)
      break;
  }

  res.json({ status: "success" });
});

app.use(bodyparser.json());
app.use("/api/v1", api);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

function handleNoteEvent(object_attributes: any, project_id: ProjectId, merge_request: any) {
  const { note } = object_attributes;
  if (note.includes('/test')) {
    handleTestEvent(merge_request, project_id);
  }
  if (note.includes('/retest') || note.includes('/ready-for-test'))
    gitlabApi.Pipelines.create(project_id, merge_request.source_branch);
  if (
    note.includes('/approve') &&
    merge_request.assignee_id === object_attributes.author_id &&
    object_attributes.author_id !== merge_request.author_id
  )
    gitlabApi.MergeRequests.accept(project_id, merge_request.iid);
  if (note.includes('/meow')) {
    // Use https://api.thecatapi.com/v1/images/search?format=json&results_per_page=1 for better caturday api 
    gitlabApi.MergeRequestNotes.create(project_id, merge_request.iid, "![cat](https://cataas.com/cat)");
  }
  if (note.includes('/report')) {
    handleReportRequest(project_id, merge_request);
  }
}

interface Job {
  name: string
  id: number
  web_url: string
}

interface Pipeline {
  id: number
  ref: string
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

// function handleReportRequest(project_id: ProjectId, merge_request: any) {
//     // TODO: Get all artifacts from jobs with stage test 
//     // TODO: Unzip json reports from artifacts and append them to merge request discussion 
//     // TODO: Attach commit hash to artifacts 
//     // TODO: Let users choose the type (code quality) and format (html,json) of report 
//   gitlabApi.Pipelines.showJobs(project_id, merge_request.head_pipeline_id).then(_ => {
//     const web_url = (<Job[]>_).filter(_ => _.name === "Code Quality")[0].web_url;
//     const reportUrl = web_url + "/artifacts/raw/gl-code-quality-report.html?inline=false";
//     gitlabApi.MergeRequestNotes.create(project_id, merge_request.iid, `Download code quality [report](${reportUrl})`);
//   });
// }

async function handleReportRequest(project_id: ProjectId, merge_request: any) {
    // TODO: Get all artifacts from jobs with stage test 
    // TODO: Unzip json reports from artifacts and append them to merge request discussion 
    // TODO: Attach commit hash to artifacts 
    // TODO: Let users choose the type (code quality) and format (html,json) of report 
  const pipelines = <Array<Pipeline>> await Promise.resolve(gitlabApi.Pipelines.all(project_id))
  const pipeline_id = pipelines.sort((a,b) => { return a.id + b.id }).filter(v => v.ref === merge_request.target_branch)[0].id
  gitlabApi.Pipelines.showJobs(project_id, pipeline_id).then(_ => {
    const web_url = (<Job[]>_).filter(_ => _.name === "Code Quality")[0].web_url;
    const reportUrl = web_url + "/artifacts/raw/gl-code-quality-report.html?inline=false";
    gitlabApi.MergeRequestNotes.create(project_id, merge_request.iid, `Download code quality [report](${reportUrl})`);
  });
}

function handleBuildEvent(projectId: ProjectId, ref: string) {
  // TODO: Implement report attaching after job finishes successful 
  gitlabApi.MergeRequests.all({ projectId, state: "opened", ref }).then(_ => console.log(_))
}