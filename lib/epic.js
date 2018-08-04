import { Observable } from "rxjs";
export function asyncEffect(asyncFn) {
    return new Observable(function (subscribe) {
        var dispatch = function (action) {
            subscribe.next(action);
            return action;
        };
        asyncFn(dispatch).then(function () { return subscribe.complete(); }, function (reason) { return subscribe.error(reason); });
    });
}
