/**
 * The RemNote Frontend API allows you to build RemNote plugins.
 * Read more here for a guide, API interface, and examples:
 * https://www.remnote.io/api
 *
 * Version 0.01
 */

/**
 * General interface:
 * RemNoteAPI.v0.makeAPICall(methodName, options);
 *
 * Helper methods (see full signatures on https://www.remnote.io/api):
 * RemNoteAPI.v0.get(remId, options);
 * RemNoteAPI.v0.get_by_name(name, options);
 * RemNoteAPI.v0.get_by_source(url, options);
 * RemNoteAPI.v0.update(remId, options);
 * RemNoteAPI.v0.delete(remId, options);
 * RemNoteAPI.v0.create(text, parentId, options);
 * RemNoteAPI.v0.get_context(options);
 */

/**
 * @typedef {Object} PluginContext
 * @property {string} documentId - The id of the Rem which is displayed as the title.
 * @property {string} remId - The Id of the Rem where the plugin was invoked.
 * @property {string} selectedTextAtActivation - The text which was selected when the plugin was invoked by a shortcut.
 */

/**
 * @typedef
 * @property {Boolean} found - Was a matching Rem found?
 * @property {RemId} _id - The Rem's ID.
 * @property {RemId| Null} parent - The Rem's parent.
 * @property {Array<RemId>} children - The Rem's children.
 * @property {RichText} name - The Rem's name.
 * @property {String} nameAsMarkdown - The Rem's name as markdown.
 * @property {RichText| Undefined} content - The Rem's content.
 * @property {String| Undefined} contentAsMarkdown - The Rem's content as markdown.
 * @property {RichText} source - The Rem's source.
 * @property {Enum(string)} remType - The Rem's type.
 * @property {Boolean} isDocument - Is this Rem marked as a document?
 * @property {Array<RemId>} visibleRemOnDocument - The descendant Rem that appear when this Rem is opened as a Document. (The order is arbitrary.)
 * @property {Date} updatedAt - The date at which this Rem was last updated
 * @property {Date} createdAt - The date at which this Rem was created
 * @property {Array<RemId>} tags - The Rem's tags.(The order is arbitrary.)
 * @property {Array<RemId>} tagChildren - The Rem that are tagged with this Rem. (The order is arbitrary.).
 */

class RemNoteAPIV0 {
  constructor() {
    this.usedMessageIds = 0;
    window.addEventListener('message', this.receiveMessage.bind(this), false);
    this.messagePromises = {};
  }

  /**
   * Get a rem by id.
   * @param {String} remId
   * @param {*} options
   */
  async get(remId, options = {}) {
    return await this.makeAPICall('get', {
      remId,
      ...options,
    });
  }

  async get_by_name(name, options = {}) {
    return await this.makeAPICall('get_by_name', {
      name,
      ...options,
    });
  }

  async get_by_source(url, options = {}) {
    return await this.makeAPICall('get_by_source', {
      url,
      ...options,
    });
  }

  async update(remId, options = {}) {
    return await this.makeAPICall('update', {
      remId,
      ...options,
    });
  }

  async delete(remId, options = {}) {
    return await this.makeAPICall('delete', {
      remId,
      ...options,
    });
  }

  async create(text, parentId, options = {}) {
    return await this.makeAPICall('create', {
      text,
      parentId,
      ...options,
    });
  }

  /**
   * Get the context information about the invokation location of the plugin.
   *
   * @param options
   * @returns {PluginContext} Information about the plugin invokation context.
   */
  async get_context(options = {}) {
    return await this.makeAPICall('get_context', options);
  }

  async close_popup(options = {}) {
    return await this.makeAPICall('close_popup', options);
  }

  async makeAPICall(methodName, options) {
    const messageId = this.usedMessageIds;
    this.usedMessageIds += 1;

    const message = {
      isIntendedForRemNoteAPI: true,
      methodName,
      options,
      messageId,
      remNoteAPIData: {
        version: 0,
      },
    };

    const messagePromise = new Promise((resolve, reject) => {
      this.messagePromises[messageId] = resolve;
      window.parent.postMessage(message, '*');
    });

    const response = await messagePromise;
    if (response.error) {
      throw response.error;
    } else {
      return response;
    }
  }

  receiveMessage(event) {
    const data = event.data;
    const messageId = data.messageId;
    this.messagePromises[messageId](data.response);
    delete this.messagePromises[messageId];
  }
}

const RemNoteAPI = {
  v0: new RemNoteAPIV0(),
};

export default RemNoteAPI;
