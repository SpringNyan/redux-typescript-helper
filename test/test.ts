import { createModelFactoryCreator } from "../lib";

describe("redux-typescript-helper", () => {
  interface SystemService {
    env: string;
  }

  interface Dependencies {
    system: SystemService;
  }

  const createModelFactory = createModelFactoryCreator<Dependencies>();

  const userModel = createModelFactory({
    id: 0,
    username: "",
    about: "",
    isLogin: false
  })
    .reducers({
      login(state, payload: { id: number; username: string; about: string }) {
        state.isLogin = true;

        state.id = payload.id;
        state.username = payload.username;
        state.about = payload.about;
      },
      logout(state) {
        state.isLogin = false;
      },
      editAbout(state, payload: string, dependencies) {
        state.about = `${dependencies.system.env} - ${payload}`;
      }
    })
    .create();
});
