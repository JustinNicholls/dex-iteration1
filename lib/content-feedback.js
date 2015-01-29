/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

/**
 * Translate into a common format for feedback items (e.g. comments or replies).


 Using new common format for feedback items...because the previous version was confusing...

 @param timestamp refers to the timestamp
 @blog_name blog_name refers the blog_name of the user who posted this note
 @param type type refers to the types of notes, which are either "like" or "reblog"
 @param post_id unqiue post_id for reblogs and comments (reblogs have post_id, likes DO NOT have post_id)
 @param added_text added_text is the comments for the reblogs (reblogs may have added_text if they have comments, likes DO NOT have added_text)


 e.g. reblogs with comments/added_text should have blog_id:"alexf388.tumblr.com", type: "reblog", post_id
 */
function translateFeedback(timestamp, blog_name, type, post_id, added_text) {
    return {
      timestamp: timestamp,
      blog_name: blog_name,
      type: type,
      post_id: post_id,
      added_text: added_text
    };
}

module.exports = translateFeedback;
