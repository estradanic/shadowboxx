import {match} from "react-router-dom";

export default interface ViewProps<Params> {
  match: match<Params>;
}
