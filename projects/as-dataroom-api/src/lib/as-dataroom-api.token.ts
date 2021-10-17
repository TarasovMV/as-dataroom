import {InjectionToken} from "@angular/core";
import {AsDataroomInterceptor} from "./as-dataroom-api.service";

/**
 * use with multi true
 */
export const DATAROOM_INTERCEPTORS: InjectionToken<AsDataroomInterceptor>
  = new InjectionToken<unknown>('interceptors for dataroom api');
