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

const PAGE_SIZE = 5;
export default class HarnessApp extends LightningElement {
    @track page = 1
    totalrecords;
    @api _pagesize = PAGE_SIZE;
    @track selectedPositions = [];
    searchExecuted;



    renderedCallback() {
        // console.log("Selected Position Ids in HarnessApp", JSON.stringify(this.selectedPositionsIds));
        console.log("rendered Callback page ", this.page);
    }

    get pagesize() {
        return this._pagesize;
    }
    set pagesize(value) {
        this._pagesize = value;
    }
    // get showSubmitButton() {
    //     return this.selectedPositions.length > 0;
    // }
    // handlePrevious() {
    //     if (this.page > 1) {
    //         this.page = this.page - 1;
    //     }
    //     console.log("previous Event page", this.page);
    //
    // }
    // handleNext() {
    //     if (this.page < this.totalPages) {
    //         this.page = this.page + 1;
    //     }
    //     console.log("next Event page ", this.page);
    // }
    // handleFirst() {
    //     this.page = 1;
    // }
    // handleLast() {
    //     this.page = this.totalPages;
    // }
    // handleRecordsLoad(event) {
    //     this.totalrecords = event.detail.totalrecords;
    //     this.totalPages = Math.ceil(this.totalrecords / this.pagesize);
    //     this.searchExecuted = false;
    // }
    //
    // handleSearchChange(event) {
    //     this.searchKey = event.detail.searchKey;
    //     this.minSalary = event.detail.minSalary;
    //     this.maxPostedDate = event.detail.maxPostedDate;
    // }

}