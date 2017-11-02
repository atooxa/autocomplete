import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import cities from '../../../static/cities.json';
import {
  POSSIBILITY_OF_SERVER_ERROR,
  MIN_WAITING_OF_SERVER_RESPONSE,
  MAX_WAITING_OF_SERVER_RESPONSE,
  ITEMS_LENGTH_TO_SHOW
} from '../../config';

const routerAPI = express.Router();

routerAPI
  .use(bodyParser.json())
  .post('/autocomplete', (req, res) => {
    const regExp = new RegExp(`^${_.escapeRegExp(req.body.query)}`, 'i');

    const filteredItems = _.filter(cities, (city) => {
      return regExp.test(city.City);
    });

    return setTimeout(() => {
      if (Math.random() < POSSIBILITY_OF_SERVER_ERROR) {
        res.status(400).end();
      } else {
        res.json({
          filteredItems: _.slice(filteredItems, 0, ITEMS_LENGTH_TO_SHOW),
          restResultsLength: Math.max(filteredItems.length - ITEMS_LENGTH_TO_SHOW, 0)
        });
      }
    }, MIN_WAITING_OF_SERVER_RESPONSE + Math.floor(Math.random() * MAX_WAITING_OF_SERVER_RESPONSE));
  });

export default routerAPI;
