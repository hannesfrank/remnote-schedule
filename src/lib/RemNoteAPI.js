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

export default {
  v0: new RemNoteAPIV0(),
};
