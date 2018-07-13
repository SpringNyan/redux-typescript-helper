import { expect } from "chai";

import { of, from, timer } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import { createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";

import { createModelFactoryCreator, createStoreHelperFactory } from "../lib";

describe("redux-typescript-helper", () => {
  interface SystemService {
    env: string;
    hash(str: string): string;
  }

  interface Dependencies {
    system: SystemService;
  }

  interface Item {
    id: number;
    title: string;
    done: boolean;
  }

  const delayTime = 50;
  const waitTime = delayTime + 10;

  const createModelFactory = createModelFactoryCreator<Dependencies>();

  const userModel = createModelFactory({
    id: 0,
    username: "",
    token: "",
    about: "",
    isLogin: false
  })
    .reducers({
      login(
        state,
        payload: { id: number; username: string; token: string; about: string }
      ) {
        state.isLogin = true;

        state.id = payload.id;
        state.token = payload.token;
        state.username = payload.username;
        state.about = payload.about;
      },
      logout(state) {
        state.isLogin = false;

        state.id = 0;
        state.token = "";
        state.username = "";
        state.about = "";
      },
      editAbout(state, payload: string, dependencies) {
        state.about = `env: ${dependencies.system.env} - ${payload}`;
      }
    })
    .effects({
      loginRequest: [
        (
          { actions, dependencies },
          payload: { username: string; password: string }
        ) => {
          return of(
            actions.login({
              id: 233,
              username: payload.username,
              token: dependencies.system.hash(payload.password),
              about: ""
            })
          ).pipe(delay(delayTime));
        },
        switchMap
      ]
    })
    .create();

  const entitiesModel = createModelFactory({
    itemById: {} as { [id: number]: Item }
  })
    .reducers({
      addItem(state, payload: Item) {
        state.itemById[payload.id] = payload;
      },
      removeItem(state, payload: number) {
        delete state.itemById[payload];
      },
      clearItems(state) {
        state.itemById = {};
      }
    })
    .effects({
      fetchItems({ actions }) {
        return from([
          actions.clearItems({}),
          actions.addItem({ id: 1, title: "abc", done: false }),
          actions.addItem({ id: 2, title: "def", done: true })
        ]).pipe(delay(delayTime));
      }
    })
    .create();

  const rootModel = createModelFactory({})
    .models({
      user: userModel,
      entities: entitiesModel
    })
    .create();

  const storeHelperFactory = createStoreHelperFactory(rootModel, {
    system: {
      env: "test",
      hash: (str: string) => str
    }
  });

  const epicMiddleware = createEpicMiddleware();
  const store = createStore(
    storeHelperFactory.reducer,
    applyMiddleware(epicMiddleware)
  );
  epicMiddleware.run(storeHelperFactory.epic);

  const storeHelper = storeHelperFactory.create(store);
  const userHelper = storeHelper.user;
  const entitiesHelper = storeHelper.entities;

  it("test", async () => {
    expect(userHelper.state.isLogin).eq(false);
    store.dispatch(
      userHelper.actions.loginRequest({
        username: "nyan",
        password: "meow"
      })
    );
    expect(userHelper.state.isLogin).eq(false);
    await timer(waitTime).toPromise();
    expect(userHelper.state.isLogin).eq(true);
    expect(userHelper.state.username).eq("nyan");

    expect(storeHelper.state.user.about).eq("");
    store.dispatch(storeHelper.actions.user.editAbout("zzz"));
    expect(storeHelper.state.user.about).eq("zzz");
  });
});
