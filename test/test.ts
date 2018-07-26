import { expect } from "chai";

import { of, from, timer } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import { createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";

import {
  createModelFactoryCreator,
  createStoreHelperFactory,
  asyncEffect
} from "../lib";

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

  const userModel = createModelFactory(() => ({
    id: 0,
    username: "",
    token: "",
    about: "",
    isLogin: false
  }))
    .selectors({
      idAndName({ state }) {
        return `${state.id} - ${state.username}`;
      }
    })
    .selectors({
      idAndNameAndAbout({ state, getters }) {
        return `${getters.idAndName} - ${state.about}`;
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
            actions.login({
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
        return of(actions.editAbout(getters.idAndName));
      }
    })
    .create();

  const entitiesModel = createModelFactory({
    itemById: {} as { [id: number]: Item }
  })
    .selectors({
      doneItems({ state }) {
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
          actions.clearItems({}),
          actions.addItem({ id: 1, title: "abc", done: false }),
          actions.addItem({ id: 2, title: "def", done: true })
        ]).pipe(delay(delayTime));
      },
      addItemAsync({ actions }, payload: Item) {
        return asyncEffect(async (dispatch) => {
          await timer(delayTime);
          dispatch(actions.addItem(payload));
        });
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
    expect(storeHelper.state.user.about).eq("test - zzz");

    store.dispatch(storeHelper.actions.user.setDefaultAbout({}));
    expect(storeHelper.state.user.about).eq("test - 233 - nyan");
    expect(storeHelper.getters.user.idAndNameAndAbout).eq(
      "233 - nyan - test - 233 - nyan"
    );

    expect(entitiesHelper.state.itemById[998]).eq(undefined);
    store.dispatch(
      entitiesHelper.actions.addItemAsync({
        id: 998,
        title: "only 998",
        done: false
      })
    );
    expect(entitiesHelper.state.itemById[998]).eq(undefined);
    await timer(waitTime).toPromise();
    expect(entitiesHelper.state.itemById[998].title).eq("only 998");

    expect(entitiesHelper.state.itemById[1]).eq(undefined);
    store.dispatch(entitiesHelper.actions.fetchItems({}));
    await timer(waitTime).toPromise();
    expect(entitiesHelper.state.itemById[1].title).eq("abc");
    expect(entitiesHelper.getters.doneItems[0].id).eq(2);
    store.dispatch(entitiesHelper.actions.removeItem(1));
    expect(entitiesHelper.state.itemById[1]).eq(undefined);

    entitiesHelper.registerModel("temp", entitiesModel);
    const tempHelper = entitiesHelper.namespace<typeof entitiesModel>("temp");

    expect(entitiesHelper.state.itemById[2].title).eq("def");
    expect(tempHelper.state.itemById[2]).eq(undefined);
    store.dispatch(
      tempHelper.actions.addItem({
        id: 2,
        title: "wow",
        done: false
      })
    );
    expect(entitiesHelper.state.itemById[2].title).eq("def");
    expect(tempHelper.state.itemById[2].title).eq("wow");
    expect((entitiesHelper.state as any)["temp"].itemById[2].title).eq("wow");
    store.dispatch(
      (entitiesHelper.actions as any)["temp"].addItem({
        id: 2,
        title: "orz",
        done: true
      })
    );
    expect(tempHelper.state.itemById[2].title).eq("orz");

    entitiesHelper.unregisterModel("temp");
    expect((entitiesHelper.state as any)["temp"]).eq(undefined);
  });
});
