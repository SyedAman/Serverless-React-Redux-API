/**
 * The API using the AWS SDK for creating notes and adding them to the DynamoDB
 * notes database.
 */

import uuid from 'uuid'
import AWS from 'aws-sdk'

import buildResponse from './lib/responses'

// set region to US East Ohio when connecting to DynamoDB
AWS.config.update({ region: 'us-east-2' })
/**
 * An object that interfaces with the DynamoDB service.
 * @type {AWS}
 */
const dynamoDB = new AWS.DynamoDB.DocumentClient()

/**
 * Lambda function for creating notes and adding them to the DynamoDB database.
 * @method main
 * @param  {Object} event - All the information about the event that
 * triggered this Lambda f unction. The request to create a note.
 * @param  {Object} context - The runtime the Lambda function is executing in.
 * @param  {Function} callback - The function called after Lambda function is
 * executed with the results or errors. AWS will respond to the HTTP request
 * with it.
 * @return {void}
 */
export function main(event, context, callback) {
  /**
   * The parsed request body representing HTTP request parameters.
   * @type {Object}
   */
  const data = JSON.parse(event.body)

  /**
   * The options used to update to the DynamoDB database, specifying table name,
   * what what item, the primary id, etc.
   * @type {Object}
   */
  const params = {
    /**
     * Name of the table of the DynamoDB to update.
     * @type {String}
     */
    TableName: 'notes',
    /**
     * The note to add to the DynamoDB.
     * @type {Object}
     */
    Item: {
      /**
       * The user identity federated through the AWS Cognito service in its
       * Cognito Identity Pool. Use the identity id from the identity pool as
       * the user id of the authenticated user.
       * @type {[type]}
       */
      userId: event.requestContext.identity.cognitoIdentityId,
      /**
       * A unique id representing the note of a specific user.
       * @type {String}
       */
      noteId: uuid.v1(),
      /**
       * The main content of the note. Containing text and other info.
       * @type {Object}
       */
      content: data.content,
      /**
       * Any other dat attached to the note, such as files.
       * @type {Object}
       */
      attachment: data.attachment,
      /**
       * When the note was created.
       * @type {Date}
       */
      createdAt: new Date().getTime()
    }
  }

  // update the DynamoDB notes table with a new note
  dynamoDB.put(params, (error, data) => {
    // handle failed table update
    if (error) {
      // send the HTTP request that AWS will respond to
      callback(null, buildResponse(500, { status:false }))
      return
    }

    // handle successful update and addition of new note to table
    // send the HTTP request that AWS will respond to
    callback(null, buildResponse(200, params.Item))
  })
}
