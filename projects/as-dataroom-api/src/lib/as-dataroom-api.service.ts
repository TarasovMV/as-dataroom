import {Inject, Injectable, Optional} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {delay, filter, map, switchMap, take, tap} from "rxjs/operators";
import {DATAROOM_INTERCEPTORS} from "./as-dataroom-api.token";
import {isArray} from "rxjs/internal-compatibility";

export interface AsDataroomInterceptor<T = unknown, U = unknown> {
  intercept: (req: Observable<T>, body: IAsDataroomParams<U>) => Observable<any>;
}
export interface IAsDataroomParams<T> {
  body: T;
  timestamp: Date;
}
type DataRoom = { [key: string]: unknown };
const DELAY: number = 1000;

@Injectable()
export class AsDataroomApiService {
  responses$: BehaviorSubject<DataRoom> = new BehaviorSubject<DataRoom>({});

  constructor(
    private http: HttpClient,
    @Optional()
    @Inject(DATAROOM_INTERCEPTORS)
      private readonly interceptors: AsDataroomInterceptor[]
  ) {
    if (!this.interceptors) {
      this.interceptors = [];
    }
    if(!isArray(this.interceptors)) {
      throw new Error('ERROR: use multi true');
    }
    this.checkRoom().subscribe();
  }

  public request<T, U>(method: string, body: T): Observable<U> {
    const uuid = uuidGenerator();
    const params: IAsDataroomParams<T> = { body, timestamp: new Date() };
    const request = this.http.post<unknown>('url', params).pipe(
      switchMap(x => this.getResponse<U>(uuid))
    );
    this.interceptors.forEach(x => { x.intercept(request, params) });
    return request;
  }

  private getResponse<T>(uuid: string): Observable<T> {
    return this.responses$.pipe(
      map(x => x[uuid] as T),
      filter(x => !!x),
      take(1)
    );
  }

  private checkRoom(): Observable<unknown> {
    return this.http.get<DataRoom>('url').pipe(
      tap(x => this.mapResponses(x)),
      delay(DELAY),
      switchMap(x => this.checkRoom())
    );
  }

  // TODO
  private checkReferences(): Observable<unknown> {
    return of(null);
  }

  private mapResponses(response: DataRoom): void {
    this.responses$.next({...this.responses$.getValue(), ...response});
  }
}

// TODO
function uuidGenerator(): string {
  return 'uuid';
}
