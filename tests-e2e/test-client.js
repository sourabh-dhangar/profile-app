const http = require('http');

class TestClient {
  constructor(baseUrl = 'http://localhost:5000') {
    const url = new URL(baseUrl);
    this.hostname = url.hostname;
    this.port = url.port || 80;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  request(path, method = 'GET', data = null, customHeaders = {}) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json',
        ...customHeaders,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const bodyData = data ? JSON.stringify(data) : null;
      if (bodyData) {
        headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      const options = {
        hostname: this.hostname,
        port: this.port,
        path,
        method,
        headers,
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      });

      req.on('error', reject);
      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  get(path, headers = {}) {
    return this.request(path, 'GET', null, headers);
  }

  post(path, data = {}, headers = {}) {
    return this.request(path, 'POST', data, headers);
  }

  put(path, data = {}, headers = {}) {
    return this.request(path, 'PUT', data, headers);
  }

  delete(path, headers = {}) {
    return this.request(path, 'DELETE', null, headers);
  }
}

module.exports = TestClient;
