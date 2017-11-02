import React from 'react';
import _ from 'lodash';

import {
  ITEMS_LENGTH_TO_SHOW
} from '../../../config';

export default class ItemsList extends React.Component {
  render() {
    const {
      visible,
      hiddenItemsLength,
      filteredItems,
      selectedItemIndex,
      selectItem
    } = this.props;

    if (!visible) return null;

    const hiddenResult = hiddenItemsLength
      ? (
        <div className="autocomplete-wrapper__list__hidden-cities">
          Показано {ITEMS_LENGTH_TO_SHOW} из {hiddenItemsLength + ITEMS_LENGTH_TO_SHOW} найденных городов.
          Уточните запрос, чтобы увидеть остальные
        </div>
      )
      : null;

    return (
      <div className="autocomplete-wrapper__list">
        {
          _.map(filteredItems, (item, index) => (
            <div className={
              "autocomplete-wrapper__list__item"
              + (index === selectedItemIndex ? ' autocomplete-wrapper__list__item_selected' : '')
            }
                 key={item.Id}
                 onClick={selectItem.bind(this, index)}
            >
              {item.City}
            </div>
          ))
        }

        {hiddenResult}
      </div>
    );
  }
}
