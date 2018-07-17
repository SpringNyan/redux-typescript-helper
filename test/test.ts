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
    .selectors({
      idAndName(state) {
        return `${state.id} - ${state.username}`;
      }
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
        state.about = `${dependencies.system.env} - ${payload}`;
      }
    })
    .effects({
      loginRequest: [
        (
          { actions, dependencies },
          payload: { username: string; password: string }
        ) => {
          return of(
            actions.login.create({
              id: 233,
              username: payload.username,
              token: dependencies.system.hash(payload.password),
              about: ""
            })
          ).pipe(delay(delayTime));
        },
        switchMap
      ],
      setDefaultAbout({ actions, getters }) {
        return of(actions.editAbout.create(getters.idAndName));
      }
    })
    .create();

  const entitiesModel = createModelFactory({
    itemById: {} as { [id: number]: Item }
  })
    .selectors({
      doneItems(state) {
        return Object.keys(state.itemById)
          .map((key) => state.itemById[parseInt(key)])
          .filter((item) => item.done);
      }
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
          actions.clearItems.create({}),
          actions.addItem.create({ id: 1, title: "abc", done: false }),
          actions.addItem.create({ id: 2, title: "def", done: true })
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
    userHelper.actions.loginRequest.dispatch({
      username: "nyan",
      password: "meow"
    });
    expect(userHelper.state.isLogin).eq(false);
    await timer(waitTime).toPromise();
    expect(userHelper.state.isLogin).eq(true);
    expect(userHelper.state.username).eq("nyan");

    expect(storeHelper.state.user.about).eq("");
    storeHelper.actions.user.editAbout.dispatch("zzz");
    expect(storeHelper.state.user.about).eq("test - zzz");

    storeHelper.actions.user.setDefaultAbout.dispatch({});
    expect(storeHelper.state.user.about).eq("test - 233 - nyan");

    expect(entitiesHelper.state.itemById[1]).eq(undefined);
    entitiesHelper.actions.fetchItems.dispatch({});
    await timer(waitTime).toPromise();
    expect(entitiesHelper.state.itemById[1].title).eq("abc");
    expect(entitiesHelper.getters.doneItems[0].id).eq(2);
    entitiesHelper.actions.removeItem.dispatch(1);
    expect(entitiesHelper.state.itemById[1]).eq(undefined);

    entitiesHelper.registerModel("temp", entitiesModel);
    const tempHelper = entitiesHelper.namespace<typeof entitiesModel>("temp");

    expect(entitiesHelper.state.itemById[2].title).eq("def");
    expect(tempHelper.state.itemById[2]).eq(undefined);
    tempHelper.actions.addItem.dispatch({
      id: 2,
      title: "wow",
      done: false
    });
    expect(entitiesHelper.state.itemById[2].title).eq("def");
    expect(tempHelper.state.itemById[2].title).eq("wow");
    expect((entitiesHelper.state as any)["temp"].itemById[2].title).eq("wow");

    entitiesHelper.unregisterModel("temp");
    expect((entitiesHelper.state as any)["temp"]).eq(undefined);
  });
});
