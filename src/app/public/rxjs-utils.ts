/**
 * rxjs-utils
 */

import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface IOptions<T> {
  initialData?: T;
  duplicate?: boolean;
  immediate?: boolean;
}

const defaultOptions: IOptions<any> = {
  immediate: false,
  duplicate: false
};

class BehaviorObservableData<T> {
  done = false;
  failed = false;
  err: string;

  get value(): T {
    return this.subject$.value;
  }

  source$: Observable<T>;

  private obs$: Observable<T>;

  private subject$: BehaviorSubject<T>;

  constructor(obs$: Observable<T>, options?: IOptions<T>) {
    options = _.merge({}, defaultOptions, options);

    this.subject$ = new BehaviorSubject<T>(options.initialData);

    this.source$ = this.subject$.asObservable();

    this.obs$ = obs$.pipe(
      tap(val => {
        if (options.duplicate) {
          this.subject$.next(_.cloneDeep(val));
        } else {
          this.subject$.next(val);
        }
      })
    );

    if (options.immediate) {
      // 立即进行一次订阅
      this.done = false;
      this.failed = false;
      this.err = '';
      const sub = this.obs$.subscribe({
        next: () => {
          this.done = true;
        },
        complete: () => {
          this.done = true;
          // 完成后取消当前订阅
          if (sub) {
            sub.unsubscribe();
          }
        },
        error: err => {
          this.done = true;
          this.failed = true;
          this.err = err.message;
        }
      });
    }
  }

  reload(): Promise<T> {
    // 外部主动刷新 执行一次新的观察
    return new Promise((resolve, reject) => {
      this.done = false;
      this.failed = false;
      this.err = '';
      const sub = this.obs$.subscribe({
        next: d => {
          resolve(d);
          this.done = true;
        },
        complete: () => {
          this.done = true;
          // 完成后取消当前订阅
          if (sub) {
            sub.unsubscribe();
          }
        },
        error: err => {
          reject(err);
          this.done = true;
          this.failed = true;
          this.err = err.message;
        }
      });
    });
  }
}

export function CreateBehaviorObservableData<T>(
  obs$: Observable<T>,
  options?: IOptions<T>
): BehaviorObservableData<T> {
  return new BehaviorObservableData<T>(obs$, options);
}
