import * as express from "express";
import * as bodyparser from "body-parser";
import { User } from "./interfaces/structs/User";
import { Demuxer } from "./Demuxer";
import { GitlabClient } from "./gitlab/GitlabClient";
import { PluginFactory } from "./PluginFactory";
import { GenericEvent } from "./interfaces/events/GenericEvent";
import { ConsoleLogger } from "./utils/ConsoleLogger";
import { LoggerWrapper } from "./utils/LoggerWrapper";

const plugins = [
  "Caturday",
  "LGTM",
  "Welcome",
  "TestRunner",
  "Blunderbuss",
  "Approve"
];

require("dotenv").config();

const gitConfig = {
  host: process.env.host,
  token: process.env.token
};

const gitExt = new GitlabClient(gitConfig);

const factory = new PluginFactory(gitExt);
const logger = new LoggerWrapper(new ConsoleLogger());
const dmuxer = new Demuxer(plugins.map(plugin => factory.make(plugin)), logger);

let botInfo: User;

gitExt.Users.current()
  .then(u => (botInfo = <User>u))
  .catch(console.error);

const LOG_LEVELS = {
  INFO: 1,
  ERROR: 2,
};

const PORT = process.env.NODE_PORT || 3000;
const LOG_LEVEL = parseInt(process.env.NODE_LOG_LEVEL) || LOG_LEVELS.ERROR;

const app = express();
const api = express.Router();

api.post("/hook", (req, res) => {
  res.contentType("application/json");

  const payload = <GenericEvent>req.body;

  if (LOG_LEVEL === LOG_LEVELS.INFO)
    logger.info(payload)

  if (
    payload.user.username === botInfo.username &&
    payload.object_kind === "note"
  ) {
    res.json({
      status: "ignored",
      reason: "self-generated payload"
    });
    return;
  }

  dmuxer.dispatch(payload);

  res.json({ status: "success" });
});

app.use(bodyparser.json());
app.use("/api/v1", api);

app.listen(PORT, () => {
  logger.info(`Listening on ${PORT}`);
});
