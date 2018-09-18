import { expect } from "chai";

import { of, timer } from "rxjs";
import { switchMap, delay } from "rxjs/operators";
import { createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";

import { createModelBuilder, createStoreHelperFactory } from "../lib";

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

  const defaultModelBuilder = createModelBuilder()
    .dependencies<Dependencies>()
    .freeze();

  const userModel = defaultModelBuilder
    .state(() => ({
      id: 0,
      username: "",
      token: "",
      about: "",
      isLogin: false
    }))
    .selectors({
      id({ dependencies }): number {
        return (dependencies.$storeHelper as typeof storeHelper).$child("user")
          .state.id;
      },
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
          expect(actions.$namespace).eq("user");

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
      setDefaultAbout: ({ actions, getters }) => async (dispatch) => {
        await dispatch(actions.editAbout(getters.idAndName));
      }
    })
    .build();

  const entitiesModel = defaultModelBuilder
    .state({
      itemById: {} as { [id: number]: Item },
      count: 0
    })
    .dynamicModels<{ temp: typeof userModel }>()
    .selectors((createSelector) => ({
      allItems: createSelector(
        ({ state }) => state.itemById,
        (itemById) =>
          Object.keys(itemById).map((key) => itemById[parseInt(key)])
      )
    }))
    .selectors({
      doneItems({ getters }) {
        return getters.allItems.filter((item) => item.done);
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
      },
      increaseCount(state) {
        return {
          ...state,
          count: state.count + 1
        };
      }
    })
    .effects({
      fetchItems: ({ actions }) => async (dispatch) => {
        await timer(delayTime).toPromise();

        await dispatch(actions.clearItems({}));
        await dispatch(actions.addItem({ id: 1, title: "abc", done: false }));
        await dispatch(actions.addItem({ id: 2, title: "def", done: true }));
      },
      addItemAsync: ({ actions }, payload: Item) => async (dispatch) => {
        await timer(delayTime);
        dispatch(actions.addItem(payload));
      },
      increaseWithError: ({ actions }) => async (dispatch) => {
        dispatch(actions.increaseCount({}));
        if (0 === 0) {
          throw new Error("error!");
        }
        dispatch(actions.increaseCount({}));
      }
    })
    .build();

  const rootModel = defaultModelBuilder
    .state({})
    .models({
      user: userModel,
      entities: entitiesModel
    })
    .selectors({
      username: ({ state }) => state.user.username
    })
    .effects({
      increaseCount: ({ actions }) => async (dispatch) => {
        await dispatch(actions.entities.increaseCount({}));
      }
    })
    .build();

  const storeHelperFactory = createStoreHelperFactory(
    rootModel,
    {
      system: {
        env: "test",
        hash: (str: string) => str
      }
    },
    {
      epicErrorHandler: (_err, caught) => caught
    }
  );

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

    expect(storeHelper.getters.user.id).eq(storeHelper.state.user.id);

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

    expect(entitiesHelper.state.count).eq(0);
    store.dispatch(entitiesHelper.actions.increaseCount({}));
    expect(entitiesHelper.state.count).eq(1);
    store.dispatch(entitiesHelper.actions.increaseWithError({}));
    expect(entitiesHelper.state.count).eq(2);
    store.dispatch(entitiesHelper.actions.increaseWithError({}));
    expect(entitiesHelper.state.count).eq(3);

    entitiesHelper.$registerModel("temp", userModel);
    const tempHelper = entitiesHelper.$child("temp")!;

    expect(tempHelper.state.username).eq("");
    store.dispatch(
      tempHelper.actions.login({
        id: 10000,
        username: "wow",
        token: "",
        about: ""
      })
    );
    expect(tempHelper.state.username).eq("wow");
    expect((entitiesHelper.state as any)["temp"].username).eq("wow");
    store.dispatch((entitiesHelper.actions as any)["temp"].logout());
    expect(tempHelper.state.username).eq("");

    entitiesHelper.$unregisterModel("temp");
    expect((entitiesHelper.state as any)["temp"]).eq(undefined);
  });
});
