import {
  Strategy,
  ExtractJwt,
  VerifiedCallback,
  StrategyOptions,
} from "passport-jwt";
import { User } from "../../../models/User";

const jwtOpt: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtVerify = async (
  payload: { googlId: string },
  done: VerifiedCallback
) => {
  if (!payload) return done(null, false, "로그인이 필요합니다.");
  console.log(payload);
  const user = await User.findByGoogleId(payload);
  done(null, user);
};

export default new Strategy(jwtOpt, jwtVerify);