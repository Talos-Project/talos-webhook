import * as express from 'express'
import * as bodyparser from 'body-parser'
import { Gitlab, ProjectId, Branches } from 'gitlab'
import { Job } from './Job';
import { Pipeline } from './Pipeline';

require("dotenv").config();

const gitlabApi = new Gitlab({
  host: process.env.host,
  token: process.env.token
});

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
    case "pipeline":
      handlePipelineEvent(req.body);
    // console.log(req.body)
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

function handleTestEvent(merge_request: any, project_id: ProjectId) {
  const variables = [
    { "key": "MR_ID", "value": merge_request.iid.toString() },
    { "key": "MR_REF", "value": merge_request.source_branch }
  ];
  gitlabApi.Pipelines.create(project_id, merge_request.target_branch, {
    variables
  }).catch(err => console.log(err));
}
/**  **handleReportRequest** invokes request report that writes a note into MR discussion */
async function handleReportRequest(project_id: ProjectId, merge_request: any) {
  const pipelines = <Pipeline[]>await Promise.resolve(gitlabApi.Pipelines.all(project_id))
  const pipeline_id = pipelines.sort((a, b) => { return a.id + b.id })
    .filter(v => v.ref === merge_request.target_branch)[0].id
  requestReport(project_id, pipeline_id, merge_request);
}

function handlePipelineEvent(pipeline) {
  const projectId = pipeline.project.id
  const status = pipeline.object_attributes.detailed_status
  const MR_ID = parseInt(pipeline.object_attributes.variables.find(v => v.key === "MR_ID").value)
  const jobID = pipeline.builds.find(b => b.name === "Code Quality").id;
  const reportUrl = generateReportURL(pipeline.project.web_url, jobID);
  if (status === "passed")
    reply(projectId, MR_ID, "Tests Passed! " + reportUrl)
}

function generateReportURL(projectURL: string, jobID: number | string) {
  return projectURL + '/-/jobs/' + jobID + "/artifacts/raw/gl-code-quality-report.html?inline=false";
}

// TODO: Extract requestReport to an interface so that you can have diffirent types of reports (code quality, coverage, etc.) 
function requestReport(project_id: ProjectId, pipeline_id: number, merge_request: any) {
  // TODO: Get all artifacts from jobs with stage test 
  // TODO: Unzip json reports from artifacts and append them to merge request discussion 
  // TODO: Attach commit hash to artifacts 
  // TODO: Let users choose the type (code quality) and format (html,json) of report 
  gitlabApi.Pipelines.showJobs(project_id, pipeline_id).then(_ => {
    // TODO: Expose report name as function argument 
    // TODO: Extract artifact path from pipeline variable 
    const jobID = (<Job[]>_).filter(_ => _.name === "Code Quality")[0].id;
    const reportUrl = generateReportURL(merge_request.target.web_url, jobID)
    const badgeUrl = `${merge_request.target.web_url}/badges/${merge_request.target_branch}/pipeline.svg`;
    const message = `![pipeline status](${badgeUrl})<br> Download code quality [report](${reportUrl})`;
    reply(project_id, merge_request.iid, message);
  });
}

function reply(projectId: ProjectId, mrId: any, text: string) {
  gitlabApi.MergeRequestNotes.create(projectId, mrId, text).catch(err => console.log(err))
}