import _ from 'lodash';
import moment from 'moment';
import LZString from 'lz-string';

export default function ApiService($http, $location, $q, HashService) {
  'ngInject';

  const api = 'https://projects.starlinewindows.com/api/quality/v1';
  const apiAuth = 'https://projects.starlinewindows.com/api/auth';

  const standardDelete = url => {
    const deferred = $q.defer();
    $http.delete(url).then(response => {
      if (response.status === 200) {
        deferred.resolve(response.data);
      } else {
        deferred.reject(response.data);
      }
    }, response => {
      deferred.reject(response);
    });
    return deferred.promise;
  };

  const standardGet = (url, params = {}) => {
    const deferred = $q.defer();
    $http.get(url, params).then(response => {
      if (response.status === 204) {
        return deferred.resolve(null);
      }
      if (response.status === 200) {
        return deferred.resolve(response.data);
      }
      deferred.reject(response.data);
    }, response => {
      if (response.status === 204) {
        return deferred.resolve(null);
      }
      deferred.reject(response);
    });
    return deferred.promise;
  };

  const saveNcmr = (url, ncmr) => {
    const deferred = $q.defer();

    // Fix dates
    ncmr.report_date = new Date(ncmr.report_date);

    // Remove duplicate lines first
    ncmr.details = _.uniq(ncmr.details, 'hash_code');

    if (ncmr._id) {
      // Update
      $http.put(`${url}/${ncmr._id}`, { ncmr }).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, () => {
        deferred.reject();
      });
    } else {
      // Create
      $http.post(url, { ncmr }).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, () => {
        deferred.reject();
      });
    }
    return deferred.promise;
  };

  const service = {};

  service.auth = {
    getAccessToken: credentials => {
      const deferred = $q.defer();

      $http({
        method: 'POST',
        url: `${apiAuth}/access_token`,
        data: credentials
      }).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, response => {
        deferred.reject(response);
      });

      return deferred.promise;
    },

    getAuthorizations: () => {
      const deferred = $q.defer();
      $http.get(`${apiAuth}/authorizations`).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, response => {
        deferred.reject(response);
      });
      return deferred.promise;
    },

    getGroupMembership: () => {
      const deferred = $q.defer();
      $http.get(`${apiAuth}/group-membership`).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, response => {
        deferred.reject(response);
      });
      return deferred.promise;
    },

    getUserDetails: () => {
      return standardGet(`${apiAuth}/user`);
    },

    refreshAccessToken: () => {
      const deferred = $q.defer();
      $http.post(`${apiAuth}/refresh_access_token`).then(response => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.data);
        }
      }, response => {
        deferred.reject(response);
      });
      return deferred.promise;
    }
  };

  service.ncmr = {
    getLookups: () => {
      const deferred = $q.defer();
      $http.get(`${api}/ncmr/lookups`).then(response => {
        const s = LZString.decompressFromUTF16(response.data.data);
        const data = angular.fromJson(s);
        deferred.resolve(data);
      });
      return deferred.promise;
    },

    external: {
      getMaterials: () => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/materials`).then(response => {
          const s = LZString.decompressFromUTF16(response.data.data);
          const data = angular.fromJson(s);
          deferred.resolve(data);
        });
        return deferred.promise;
      },
      all: params => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/external`, { params }).then(response => {
          if (response.status === 204) {
            return deferred.resolve(null);
          }
          if (response.status === 200) {
            return deferred.resolve(response.data);
          }
          deferred.reject(response);
        }, response => {
          if (response.status === 204) {
            return deferred.resolve(null);
          }
          deferred.reject();
        });
        return deferred.promise;
      },
      findOne: _id => {
        const deferred = $q.defer();
        standardGet(`${api}/ncmr/external/${_id}`).then(ncmr => {
          ncmr.report_date = moment(ncmr.report_date).toDate();
          deferred.resolve(ncmr);
        }, err => {
          deferred.reject(err);
        });
        return deferred.promise;
      },
      getNextReportNumber: () => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/external/next-report-number`).then(response => {
          if (response.status === 200) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        }, response => {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      remove: ncmr => {
        return standardDelete(`${api}/ncmr/external/${ncmr._id}`);
      },
      save: ncmr => {
        return saveNcmr(`${api}/ncmr/external`, ncmr);
      }
    },

    fabrication: {
      all: params => {
        return standardGet(`${api}/ncmr/fabrication`, { params });
      },
      findOne: _id => {
        return standardGet(`${api}/ncmr/fabrication/${_id}`);
      },
      findLineInfo: code => {
        return standardGet(`${api}/ncmr/fabrication/get-line-info/${code}`);
      },
      getNextReportNumber: () => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/fabrication/next-report-number`).then(response => {
          deferred.resolve(response.data);
        }, () => {
          deferred.resolve(1);
        });
        return deferred.promise;
      },
      remove: ncmr => {
        return standardDelete(`${api}/ncmr/fabrication/${ncmr._id}`);
      },
      save: (ncmr) => {
        return saveNcmr(`${api}/ncmr/fabrication`, ncmr);
      },
      getPanels: params => {
        const deferred = $q.defer();
        const p = angular.copy(params);

        if (p.tableState && p.tableState.search && p.tableState.search.predicateObject) {
          if (p.tableState.search.predicateObject.header) {
            const search = angular.copy(p.tableState.search.predicateObject.header);
            angular.forEach(search, (v, k) => {
              if (k === 'list_number') {
                p.tableState.search.predicateObject = { 'orders.processreference': v };
              }
            });
          }
        }

        $http.get(`${api}/ncmr/lookups/panels`, { params }).then(response => {
          deferred.resolve(response.data);
        }, () => {
          deferred.resolve([]);
        });
        return deferred.promise;
      }
    },

    internal: {
      getMaterialsRequired: (start, count, predicate = null) => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/materials-required`, { params: { start, count, predicate } }).then(response => {
          angular.forEach(response.data, row => {
            angular.forEach(row.materials, material => {
              const key = [row.header.list_number, material.profile, material.stock_length].join('.');
              material.hash_code = HashService.hash(key);

              angular.forEach(material.extrusions, extrusion => {
                const key = [row.header.list_number, extrusion.profile, material.stock_length, extrusion.color].join('.');
                extrusion.hash_code = HashService.hash(key);
              });
            });
          });

          deferred.resolve(response.data);
        });
        return deferred.promise;
      },
      all: params => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/internal`, { params }).then(response => {
          if (response.status === 204) {
            return deferred.resolve(null);
          }
          if (response.status === 200) {
            return deferred.resolve(response.data);
          }
          deferred.reject(response);
        }, response => {
          if (response.status === 204) {
            return deferred.resolve(null);
          }
          deferred.reject();
        });
        return deferred.promise;
      },
      findOne: _id => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/internal/${_id}`).then(response => {
          if (response.status === 200) {
            angular.forEach(response.data.details, line => {
              const key = [line.list_number, line.profile, line.stock_length, line.color].join('.');
              line.hash_code = HashService.hash(key);
            });

            response.data.report_date = moment(response.data.report_date).toDate();
            deferred.resolve(response.data);
          } else {
            deferred.reject(response);
          }
        });
        return deferred.promise;
      },
      getNextReportNumber: () => {
        const deferred = $q.defer();
        $http.get(`${api}/ncmr/internal/next-report-number`).then(response => {
          if (response.status === 200) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        }, response => {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      save: ncmr => {
        return saveNcmr(`${api}/ncmr/internal`, ncmr);
      },
      remove: ncmr => {
        return standardDelete(`${api}/ncmr/internal/${ncmr._id}`);
      }
    }
  };

  service.pqp = {
    getEmployeeLocations: () => {
      return standardGet(`${api}/pqp/employee-locations`);
    },
    getExtrusionQualityCategories: () => {
      return standardGet(`${api}/pqp/extrusion-quality-categories`);
    },
    getFabricationTypes: () => {
      return standardGet(`${api}/pqp/fabrication-types`);
    },
    getFrameSeries: () => {
      return standardGet(`${api}/pqp/frame-series`);
    },
    getInventoryCategories: () => {
      return standardGet(`${api}/pqp/inventory-categories`);
    },
    getInventoryTypes: () => {
      return standardGet(`${api}/pqp/inventory-types`);
    },
    getMaterialHandlingCategories: () => {
      return standardGet(`${api}/pqp/material-handling-categories`);
    },
    getProductivityDepartments: () => {
      return standardGet(`${api}/pqp/productivity-departments`);
    },
    getReport: reportDate => {
      return standardGet(`${api}/pqp/reports/${reportDate}`);
    },
    getSealedUnitCategories: () => {
      return standardGet(`${api}/pqp/sealed-unit-categories`);
    },
    lookUp: (lookUp, params) => {
      return standardGet(`${api}/pqp/lookup/${lookUp}`, params);
    },
    save: data => {
      if (data.Id) {
        return $http.put(`${api}/pqp/reports/${data.Id}`, data);
      }
      return $http.post(`${api}/pqp/reports`, data);
    }
  };

  return service;
}
