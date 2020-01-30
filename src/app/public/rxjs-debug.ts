/**
 * rxjs-debug
 */

import { BehaviorSubject, Observable, of, Subject, timer } from 'rxjs';
import { delay, shareReplay, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

export function CreateInstrument<T>(source: Observable<T>) {
  return new Observable<T>(observer => {
    console.log('source: subscribing');
    const subscription = source
      .pipe(
        tap(value => {
          console.log(`source: emit ` + JSON.stringify(value));
        })
      )
      .subscribe(observer);
    return () => {
      subscription.unsubscribe();
      console.log('source: unsubscribed');
    };
  });
}

export function CreateObserver<T>(name: string) {
  return {
    next: (value: T) =>
      console.log(`observer ${name} next: ${JSON.stringify(value)}`),
    complete: () => console.log(`observer ${name} complete`)
  };
}

export function ReplySubjectDemo(source$?: Observable<any>) {
  const routeEnd = new Subject();
  routeEnd.next(0);

  const subject$ = new BehaviorSubject(null);

  source$ = CreateInstrument(
    fromPromise(
      Promise.resolve(0).then(x => {
        console.log('Promise resolve：' + x);
        return x;
      })
    )
  ).pipe(
    tap(val => console.log('   tap：' + val)),
    tap(val => subject$.next(val))
  );

  subject$.subscribe(CreateObserver('a'));

  timer(3000).subscribe(() => {
    source$.subscribe(CreateObserver('d'));
  });
}

export function ShareReplayDemo(source$?: Observable<any>) {
  // 每隔1秒发出数字
  // source$ = interval(1000).pipe(take(10));
  source$ = of(0).pipe(delay(3000));

  source$ = CreateInstrument(source$).pipe(
    shareReplay({
      bufferSize: 1,
      refCount: false
    })
  );

  let b, c, d, e;

  const a = source$.subscribe(CreateObserver('a'));

  // 2秒后 添加新的订阅者
  timer(2000).subscribe(() => {
    console.log('添加新的订阅者b,c');
    b = source$.subscribe(CreateObserver('b'));
    c = source$.subscribe(CreateObserver('c'));
  });

  // 再过2秒 取消所有订阅
  timer(4000).subscribe(() => {
    console.log('取消所有订阅，引用计数归0');
    a.unsubscribe();
    b.unsubscribe();
    c.unsubscribe();

    // 取消所有订阅后，引用计数归0, 2秒后添加新的订阅者
    timer(2000).subscribe(() => {
      console.log('取消所有订阅后，添加新的订阅者d');
      d = source$.subscribe(CreateObserver('d'));
    });
  });

  // 源事件完成后，添加新的订阅者
  timer(12000).subscribe(() => {
    console.log('源事件完成后，添加新的订阅者e');
    e = source$.subscribe(CreateObserver('e'));
  });
}
