import React from 'react';

import ItemsList from '../ItemsList';

export default class SearchingResult extends React.Component {
  render() {
    const {
      visible,
      loadingData,
      serverError,
      emptyResult,
      filteredItems,
      hiddenItemsLength,
      selectedItemIndex,
      selectItem,
      refreshSearching
    } = this.props;

    if (!visible) return null;

    const loadingIcon = loadingData
      ? (
        <div className="autocomplete-wrapper__searching-result__results-loading">
          <img src="/static/loading.svg"/>
          Загрузка
        </div>
      )
      : null;

    const serverErrorMessage = serverError && !loadingData
      ? (
        <div className="autocomplete-wrapper__searching-result__server-error">
          <div className="autocomplete-wrapper__searching-result__server-error__message">
            Что-то пошло не так. Проверьте соединение с интернетом и попробуйте еще раз
          </div>

          <div className="autocomplete-wrapper__searching-result__server-error__refresh"
               onClick={refreshSearching}
          >
            Обновить
          </div>
        </div>
      )
      : null;

    const notFound = emptyResult && !loadingData
      ? (
        <div className="autocomplete-wrapper__searching-result__empty-result">
          Не найдено
        </div>
      )
      : null;

    return (
      <div className="autocomplete-wrapper__searching-result">
        {loadingIcon}
        <ItemsList visible={filteredItems.length}
                   hiddenItemsLength={hiddenItemsLength}
                   filteredItems={filteredItems}
                   selectedItemIndex={selectedItemIndex}
                   selectItem={selectItem}
        />
        {notFound}
        {serverErrorMessage}
      </div>
    );
  }
}
