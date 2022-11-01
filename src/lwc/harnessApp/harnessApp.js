/**
 * Created by yurii.bubis on 10/27/2022.
 */
/**
 * Треба перемістити апекс методи з paginatorParent сюди і виконувати пошук тут.
 * Можуть виникати проблеми з паджинацією, можливо вся ця затія не вартує того і
 * ми просто строку пошуку залишимо в елементі paginatorParent і вона буде на пів екрану.
 */
import {LightningElement, api, track} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import getPositionsList from '@salesforce/apex/RecruitmentIntegration.getPositionsList';
import getPositionsCount from '@salesforce/apex/RecruitmentIntegration.getPositionsCount';

const PAGE_SIZE = 5;
export default class HarnessApp extends LightningElement {
    @track page = 1;
    @api totalrecords;
    @api _pagesize = PAGE_SIZE;
    @track selectedPositions = [];
    showModal;
    // searchKey;
    // minSalary;
    // maxPostedDate;
    // @track allPositions = [];

    get pagesize() {
        return this._pagesize;
    }
    set pagesize(value) {
        this._pagesize = value;
    }
    get showSubmitButton() {
        return this.selectedPositions.length > 0;
    }
    handlePrevious() {
        if (this.page > 1) {
            this.page = this.page - 1;
        }
    }
    handleNext() {
        if (this.page < this.totalPages) {
            this.page = this.page + 1;
        }
        console.log("next button pressed and value is ", this.page);
    }
    handleFirst() {
        this.page = 1;
    }
    handleLast() {
        this.page = this.totalPages;
    }
    handleRecordsLoad(event) {
        console.log("total records ", event.detail);
        this.totalrecords = event.detail;
        this.totalPages = Math.ceil(this.totalrecords / this.pagesize);
    }
    handlePageChange(event) {
        this.page = event.detail;
    }
    handleApply(event) {
        l
        const position = event.detail;
        if (!this.selectedPositions.includes(position)) {
            this.selectedPositions = [...this.selectedPositions, event.detail];
        } else {
            this.dispatchEvent( new ShowToastEvent({
                title: "Error",
                message: "This position already in the list!",
                variant: "warning"
            }));
        }
    }
    handleSearchChange(event) {
        console.log("Search in harnessApp", JSON.parse(JSON.stringify(event.detail)));
        this.searchKey = event.detail.searchKey;
        this.minSalary = event.detail.minSalary;
        this.maxPostedDate = event.detail.maxPostedDate;
    }
    removeSelectedPosition(event) {
        const positionId = event.target.dataset.id;
        this.selectedPositions = this.selectedPositions.filter(position => position.Id !== positionId);
    }
    submitApplication() {
        this.showModal = true;
    }
    handleModalClosed() {
        this.selectedPositions = [];
    }
}