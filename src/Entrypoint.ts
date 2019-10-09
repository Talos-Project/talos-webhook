import * as express from 'express'
import * as bodyparser from 'body-parser'
import { User } from './interfaces/structs/User';
import { Demuxer } from './Demuxer';
import { GitlabClient } from './gitlab/GitlabClient';
import { PluginFactory } from './PluginFactory';
import { GenericEvent } from './interfaces/events/GenericEvent';
import { ConsoleLogger } from './utils/ConsoleLogger';

const plugins = ["Caturday", "LGTM", "Welcome", "TestRunner"]

require("dotenv").config();

const gitConfig = {
  host: process.env.host,
  token: process.env.token
};

const gitExt = new GitlabClient(gitConfig);

const factory = new PluginFactory(gitExt)
const dmuxer = new Demuxer(
  plugins.map(plugin => factory.make(plugin)),
  new ConsoleLogger()
)

let botInfo: User;

gitExt.Users.current()
  .then(u => botInfo = <User>u)
  .catch(console.error)

const PORT = process.env.NODE_PORT || 3000;
const app = express();
const api = express.Router();

api.post("/hook", (req, res) => {

  res.contentType("application/json")

  const payload = <GenericEvent>req.body;

  console.log(payload);

  if (payload.user.username === botInfo.username) {
    res.json({ status: "ignored", reason: "self-generated payload" })
    return
  }

  dmuxer.dispatch(payload)

  res.json({ status: "success" });

});

app.use(bodyparser.json());
app.use("/api/v1", api);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
