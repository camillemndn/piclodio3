import { Injectable } from '@angular/core';

// we supose that the backend is on the same server. if not, replace this export by a hard coded ip
export const hostname = document.location.hostname
export const BASE_API_URL = document.location.protocol + "//" + hostname + "/api"

@Injectable()
export class globalVariables {
    BASE_API_URL: string = BASE_API_URL;
}
