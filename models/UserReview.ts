import BaseModel                                        = require('../models/BaseModel');

class UserReview extends BaseModel
{
    static TABLE_NAME:string                            = 'user_review';

    static TARGET_USER_ID:string                        = 'target_user_id';
    static ITEM_ID:string                               = 'item_id';
    static RATING:string                                = 'rating';
    static REVIEW:string                                = 'review';
    static FROM_USER_ID:string                          = 'from_user_id';

    static DEFAULT_FIELDS:string[] = [UserReview.ID, UserReview.TARGET_USER_ID, UserReview.ITEM_ID, UserReview.RATING,
        UserReview.REVIEW, UserReview.FROM_USER_ID];

    private target_user_id:number;
    private item_id:number;
    private rating:number;
    private review:string;
    private from_user_id:number;
    
    /* Getters */
    getTargetUserId():number                            { return this.target_user_id; }
    getItemId():number                                  { return this.item_id; }
    getRating():number                                  { return this.rating; }
    getReview():string                                  { return this.review; }
    getFromUserId():number                              { return this.from_user_id; }

    /* Setters */
    setTargetUserId(val:number)                         { this.target_user_id = val; }
    setItemId(val:number)                               { this.item_id = val; }
    setRating(val:number)                               { this.rating = val; }
    setReview(val:string)                               { this.review = val; }
    setFromUserId(val:number)                           { this.from_user_id = val; }
}
export = UserReview