/**
 * Created by yurii.bubis on 10/26/2022.
 */

import {api, LightningElement} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import {dispatchToast} from "c/toastDispatcher";
import processApplication from '@salesforce/apex/JobApplicationHelper.processApplication';
import Upload_photo_title from "@salesforce/label/c.Upload_photo_title";
import Upload_photo_message from "@salesforce/label/c.Upload_photo_message";
import Invalid_file_type from "@salesforce/label/c.Invalid_file_type";
import Success_Job_Application from "@salesforce/label/c.Success_Job_Application";
import Attach_your_photo from "@salesforce/label/c.Attach_your_photo";
import Error from "@salesforce/label/c.Error";
import Success from "@salesforce/label/c.Success";
import Submit from "@salesforce/label/c.Submit";
import Cancel from "@salesforce/label/c.Cancel";
import Reset from "@salesforce/label/c.Reset";
import Close from "@salesforce/label/c.Close";


const CONSTANTS = {
    toastSuccess: "success",
    toastWarning: "warning",
    toastError: "error"
}
export default class Modal extends LightningElement {
    @api showModal;
    @api selectedPositions;
    selectedPositionsIds = [];
    fileUploaded;
    fileName;
    candidateJson;
    imageJson;
    selectedPositionsJson;
    successfulCreation = false;
    submitLabel = Submit;
    cancelLabel = Cancel;
    resetLabel = Reset;
    closeLabel = Close;
    attachYourPhoto = Attach_your_photo;

    @api show() {
        this.showModal = true;
    }

    @api hide() {
        this.showModal = false;
        this.dispatchEvent(new CustomEvent('modalclosed', {detail: this.successfulCreation}));
        this.successfulCreation = false;
        this.fileUploaded = null;
        this.fileName = null;
    }

    renderedCallback() {
        this.selectedPositionsIds = this.selectedPositions.map(position => position.Id);
    }

    handleSubmit(event) {
        event.preventDefault();
        const candidate = event.detail.fields;
        this.candidateJson = JSON.stringify(candidate);
        if (this.fileUploaded) {
            this.uploadHelper();
        } else {
            dispatchToast(
                Upload_photo_title,
                Upload_photo_message,
                CONSTANTS.toastWarning
            );
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            if (element.type === "checkbox" || element.type === "checkbox-button") {
                element.checked = false;
            } else {
                element.value = null;
            }
        });
        this.fileUploaded = null;
        this.fileName = null;
    }

    handleFilesChange(event) {
        if (event.target.files.length === 0) {
            if (event.target.files[0].type != "image/jpeg"&& event.target.files[0].type != "image/png") {
                this.fileName = Invalid_file_type;
            }
        } else {
            this.fileUploaded = event.target.files[0];
            this.fileName = event.target.files[0].name;
        }
    }

    uploadHelper() {
        const file = this.fileUploaded;
        const fileReader = new FileReader();
        fileReader.onloadend = (() => {
            let fileContents = fileReader.result;
            const base64 = 'base64,';
            const content = fileContents.indexOf(base64) + base64.length;
            fileContents = fileContents.substring(content);
            const fileToStringify = {
                "fileName": this.fileName,
                "base64": encodeURIComponent(fileContents)
            };
            this.imageJson = JSON.stringify(fileToStringify);
            this.selectedPositionsJson = JSON.stringify(this.selectedPositionsIds);
            this.processApplication();
        });
        fileReader.readAsDataURL(file);
    }

    processApplication() {
        processApplication({candidateJson: this.candidateJson,
            imageJson: this.imageJson ,
            selectedPositionsIds: JSON.stringify(this.selectedPositionsIds)
        })
            .then((result) => {
                dispatchToast(
                    Success,
                    Success_Job_Application,
                    CONSTANTS.toastSuccess
                );
                this.successfulCreation = true;
                this.hide(true);
            })
            .catch((error) => {
                dispatchToast(
                    Error,
                    error,
                    CONSTANTS.toastError
                );
            });
    }
    // dispatchToast(title, message, variant) {
    //     this.dispatchEvent( new ShowToastEvent({
    //         title: title,
    //         message: message,
    //         variant: variant
    //     }));
    // }
}