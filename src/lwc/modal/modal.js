/**
 * Created by yurii.bubis on 10/26/2022.
 */

import {api, LightningElement, track} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import processApplication from '@salesforce/apex/JobApplicationHelper.processApplication';


const CSS_CLASS = 'modal-hidden';

export default class Modal extends LightningElement {
    @api showModal;
    @api selectedPositionsIds;
    candidate;
    savedRecordId;
    fileUplodaed;
    fileReader;
    file;
    content;
    fileContents;
    position;
    fileName;
    candidateJson;
    imageJson;
    selectedPositionsJson;
    fileToStringify;

    @api show() {
        this.showModal = true;
    }

    @api hide() {
        this.showModal = false;
        this.dispatchEvent(new CustomEvent('modalclosed'));
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        this.candidate = fields;
        this.candidateJson = JSON.stringify(this.candidate);
        console.log(this.selectedPositionsIds);
        if (this.fileUplodaed) {
            console.log("image is provided");
            this.uploadHelper();
        } else {
            console.log("toast would be shown");
            this.dispatchEvent( new ShowToastEvent ({
                title: "Upload your photo",
                message: "To submit your application you need to provide your photo",
                variant: "warning"
            }));
        }

    }

    handleSuccess(event) {
        console.log()
        this.savedRecordId = event.detail.id;
        this.dispatchEvent(new CustomEvent("recordsuccess", {detail: this.savedRecordId}));
        this.hide();
        //
        // const toast = new ShowToastEvent({
        //     title: "Success!",
        //     variant: "success",
        //     message: "Job application created successfully"
        // });
        // this.dispatchEvent(toast);
    }

    // handleUploadFinished(event) {
    //     const toast = new ShowToastEvent({
    //         title: "Success!",
    //         variant: "success",
    //         message: "Image uploaded successfully"
    //     });
    //     this.dispatchEvent(toast);
    //     this.hide();
    // }
    handleFilesChange(event) {
        if (event.target.files.length === 0) {
            if (event.target.files[0].type != 'image/jpeg' && event.target.files[0].type != 'image/png') {
                this.fileName = "Invalid file type!";
            }
        } else {
            console.log('inside handeFilesChange');
            this.fileUplodaed = event.target.files[0];
            this.fileName = event.target.files[0].name;

        }

    }
    handleSave() {
        // if (this.fileUplodaed.length > 0) {
            console.log("inside handleSave");
            this.uploadHelper();

        // }
    }
    uploadHelper() {
        this.file = this.fileUplodaed;
        this.fileReader = new FileReader();
        // set onload function of FileReader object
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);

            this.fileToStringify = {
                "fileName": this.fileUplodaed.name,
                "base64": encodeURIComponent(this.fileContents)
            };
            this.imageJson = JSON.stringify(this.fileToStringify);
            this.selectedPositionsJson = JSON.stringify(this.selectedPositionsIds);
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
                    console.log("success", result)
                })
                .catch((error) => {
                    console.log("error", error);
                });
        });
        this.fileReader.readAsDataURL(this.file);

    }

    handleModalClose() {
        //Let parent know that dialog is closed (mainly by that cross button) so it can set proper variables if needed
        const closedialog = new CustomEvent('closedialog');
        this.dispatchEvent(closedialog);
        this.hide();
    }
}