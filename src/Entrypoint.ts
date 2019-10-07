import * as express from 'express'
import * as bodyparser from 'body-parser'
import { Gitlab } from 'gitlab'
import { User } from './User';
import { handleNoteEvent, handlePipelineEvent, handleMergeRequestEvent } from './App';

require("dotenv").config();
export const ownersFileName = 'OWNERS';

const gitConfig = {
  host: process.env.host,
  token: process.env.token
};

export const gitlabApi = new Gitlab(gitConfig);

export let botInfo: User;

gitlabApi.Users.current().then(u => botInfo = <User>u)

const PORT = process.env.NODE_PORT || 3000;
const app = express();
const api = express.Router();

api.post("/hook", (req, res) => {
  const { object_kind } = req.body;
  console.log(req.body);

  switch (object_kind) {
    case "note":
      handleNoteEvent(req.body);
      break;
    case "pipeline":
      handlePipelineEvent(req.body);
      break;
    case "merge_request":
      handleMergeRequestEvent(req.body);
      break;
    default:
      console.log("Unhandled request")
      break;
  }

  res.json({ status: "success" });
});

app.use(bodyparser.json());
app.use("/api/v1", api);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

