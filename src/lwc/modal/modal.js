/**
 * Created by yurii.bubis on 10/26/2022.
 */

import {api, LightningElement} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import processApplication from '@salesforce/apex/JobApplicationHelper.processApplication';

export default class Modal extends LightningElement {
    @api showModal;
    @api selectedPositions;
    selectedPositionsIds = [];
    fileUploaded;
    fileName;
    candidateJson;
    imageJson;
    selectedPositionsJson;

    @api show() {
        this.showModal = true;
    }

    @api hide() {
        this.showModal = false;
        this.dispatchEvent(new CustomEvent('modalclosed'));
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
            this.dispatchEvent( new ShowToastEvent ({
                title: "Upload your photo",
                message: "To submit your application you need to provide your photo",
                variant: "warning"
            }));
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            if (element.type === 'checkbox' || element.type === 'checkbox-button') {
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
            if (event.target.files[0].type != 'image/jpeg' && event.target.files[0].type != 'image/png') {
                this.fileName = "Invalid file type!";
            }
        } else {
            console.log('inside handeFilesChange');
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
                this.dispatchEvent( new ShowToastEvent({
                    title: "Success",
                    message: "Job application created successfully!",
                    variant: "success"
                }));
                this.hide();
            })
            .catch((error) => {
                this.dispatchEvent( new ShowToastEvent({
                    title: "Error",
                    message: error,
                    variant: "error"
                }));
            });
    }
}