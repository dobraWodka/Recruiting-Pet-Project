/**
 * Created by yurii.bubis on 10/27/2022.
 */

import {LightningElement} from 'lwc';
import Job_application_interface from "@salesforce/label/c.Job_application_interface";

export default class HarnessApp extends LightningElement {
    jobApplicationLabel = Job_application_interface;
}