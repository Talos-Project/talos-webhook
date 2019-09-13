import * as express from 'express'
import * as bodyparser from 'body-parser'
import { Gitlab, ProjectId } from 'gitlab'

require("dotenv").config();

const gitlabApi = new Gitlab({
  host: process.env.host,
  token: process.env.token
});

// gitlabApi.Users.current().then(val => console.log(val))
// gitlabApi.Users.all().then(_ => console.log(_))

const PORT = process.env.NODE_PORT || 3000;
const app = express();
const api = express.Router();

api.post("/hook", (req, res) => {
  const { project_id, object_kind, object_attributes, builds, merge_request } = req.body;
  console.log(req.body);

  if (object_kind === "note") {
    handleNoteEvent(object_attributes, project_id, merge_request);
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
  if (note.includes('/retest') || note.includes('/ready-for-test'))
    gitlabApi.Pipelines.create(project_id, merge_request.source_branch);
  if (note.includes('/approve') && merge_request.assignee_id === object_attributes.author_id)
    gitlabApi.MergeRequests.accept(project_id, merge_request.iid);
  if (note.includes('/meow')) {
    gitlabApi.MergeRequestNotes.create(project_id, merge_request.iid, "![cat](https://cataas.com/cat)");
  }
  if (note.includes('/report')) {

    interface Job {
      name: string
      id: number
      web_url: string
    }

    // TODO: Get all artifacts from jobs with stage test 
    // TODO: Unzip json reports from artifacts and append them to merge request discussion 
    // TODO: Attach commit hash to artifacts 
    // TODO: Let users choose the type (code quality) and format (html,json) of report 
    gitlabApi.Pipelines.showJobs(project_id, merge_request.head_pipeline_id).then(_ => {
      const web_url = (<Job[]>_).filter(_ => _.name === "Code Quality")[0].web_url
      const reportUrl = web_url + "/artifacts/raw/gl-code-quality-report.html?inline=false"
      gitlabApi.MergeRequestNotes.create(project_id, merge_request.iid, `Download code quality [report](${reportUrl})`);
    })
  }
}
