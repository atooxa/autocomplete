import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import SearchingResult from './SearchingResult';
import Input from './Input';
import {
  DEBOUNCE_INPUT_DELAY,
  KEY_CODES,
  MIN_LOADING_ICON_SHOWING,
  DELAY_BEFORE_SHOWING_LOADING_ICON
} from '../../config';

export class Autocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
    this.timeoutBeforeShowingLoadingIcon = null;
    this.timeoutBeforeHiddingLoadingIcon = null;
    this.infoToShowAfterLoadingIcon = {
      filteredItems: [],
      hiddenItemsLength: 0,
      query: '',
      serverError: false
    };
    this.timestampOfStartingToShowLoadingIcon = Date.now();
    this.isPristine = true;

    this.onChange = this.onChange.bind(this);
    this.onChangeDebounced = _.debounce(this.onChange, DEBOUNCE_INPUT_DELAY);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.fetchAndHandleAutocompleteList = this.fetchAndHandleAutocompleteList.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.refreshSearching = this.refreshSearching.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
    this.focusNextInput = this.focusNextInput.bind(this);
  }

  getInitialState() {
    return {
      chosenItem: null,
      filteredItems: [],
      hiddenItemsLength: 0,
      selectedItemIndex: 0,
      emptyResult: false,
      emptyInputError: false,
      serverError: false,
      loadingData: false
    }
  }

  onChange() {
    const {
      state: {
        emptyInputError
      },
      inputElem,
      timeoutBeforeShowingLoadingIcon,
      timeoutBeforeHiddingLoadingIcon
    } = this;

    clearTimeout(timeoutBeforeShowingLoadingIcon);
    clearTimeout(timeoutBeforeHiddingLoadingIcon);

    if (inputElem.value === '') {
      this.setState(this.getInitialState());

      return;
    }

    this.setState({
      chosenItem: null
    });

    if (emptyInputError) return;

    this.fetchAndHandleAutocompleteList({ query: inputElem.value, loadingAnimationDelay: DELAY_BEFORE_SHOWING_LOADING_ICON });
  }

  fetchAndHandleAutocompleteList({ query, loadingAnimationDelay }) {
    const {
      state: {
        loadingData
      }
    } = this;

    if (!loadingData) {
      this.timeoutBeforeShowingLoadingIcon = setTimeout(() => {
        this.setState({
          loadingData: true
        });

        this.timestampOfStartingToShowLoadingIcon = Date.now();
        this.timeoutBeforeShowingLoadingIcon = null;
      }, loadingAnimationDelay);
    } else {
      this.timestampOfStartingToShowLoadingIcon = Date.now();
    }

    $
      .ajax({
        url: '/api/autocomplete',
        type: 'POST',
        data: JSON.stringify({ query }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
      })
      .done(({ filteredItems, restResultsLength: hiddenItemsLength }) => {
        const {
          state: {
            emptyInputError,
            loadingData
          },
          inputElem
        } = this;

        if (inputElem.value.toLowerCase() !== query.toLowerCase() || emptyInputError) return;

        if (loadingData) {
          this.infoToShowAfterLoadingIcon = {
            filteredItems,
            hiddenItemsLength,
            query,
            serverError: false
          };

          return;
        }

        this.setState(_.merge(this.getInitialState(), {
          filteredItems,
          hiddenItemsLength,
          emptyResult: !filteredItems.length,
        }));
      })
      .fail(() => {
        const {
          state: {
            emptyInputError,
            loadingData
          },
          inputElem
        } = this;

        if (query.toLowerCase() !== inputElem.value.toLowerCase() || emptyInputError) return;

        if (loadingData) {
          this.infoToShowAfterLoadingIcon = {
            serverError: true
          };

          return;
        }

        this.setState(_.merge(this.getInitialState(), {
          serverError: true
        }));
      })
      .always(() => {
        const {
          state: {
            emptyInputError,
            loadingData
          },
          inputElem
        } = this;

        if (query.toLowerCase() !== inputElem.value.toLowerCase() || emptyInputError) return;

        if (!loadingData && this.timeoutBeforeShowingLoadingIcon) {
          clearTimeout(this.timeoutBeforeShowingLoadingIcon);

          this.timeoutBeforeShowingLoadingIcon = null;
        }

        if (!loadingData) return;

        clearTimeout(this.timeoutBeforeHiddingLoadingIcon);

        this.timeoutBeforeHiddingLoadingIcon = setTimeout(() => {
          const {
            infoToShowAfterLoadingIcon,
            inputElem
          } = this;

          const updatedState = {
            loadingData: false,
            serverError: infoToShowAfterLoadingIcon.serverError,
            emptyResult: false
          };

          if (updatedState.serverError) {
            _.merge(updatedState, {
              filteredItems: [],
              hiddenItemsLength: 0
            });
          } else if (inputElem.value.toLowerCase() === infoToShowAfterLoadingIcon.query.toLowerCase()) {
            _.merge(updatedState, {
              filteredItems: infoToShowAfterLoadingIcon.filteredItems || [],
              hiddenItemsLength: infoToShowAfterLoadingIcon.hiddenItemsLength || 0,
              emptyResult: !infoToShowAfterLoadingIcon.filteredItems.length
            });
          }

          this.infoToShowAfterLoadingIcon = {};

          this.setState(updatedState);

          this.timeoutBeforeHiddingLoadingIcon = null;
        }, Math.max(MIN_LOADING_ICON_SHOWING - (Date.now() - this.timestampOfStartingToShowLoadingIcon), 0));
      });
  }

  refreshSearching() {
    this.fetchAndHandleAutocompleteList({
      query: this.inputElem.value,
      loadingAnimationDelay: 0
    });
  }

  onKeyDown(e) {
    const {
      keyCode
    } = e;
    const {
      state: {
        filteredItems,
        selectedItemIndex,
        serverError,
        loadingData
      },
      inputElem
    } = this;

    const isNeededKeyCode = _.find(KEY_CODES, (x) => x === keyCode);

    if (isNeededKeyCode) {
      e.preventDefault();

      const updatedState = {};

      switch (keyCode) {
        case 13: {
          if (loadingData) return;

          if (serverError) {
            return this.refreshSearching();
          }

          this.selectItem(selectedItemIndex);

          break;
        }

        case 38: {
          _.merge(updatedState, {
            selectedItemIndex: Math.max(selectedItemIndex - 1, 0),
          });

          break;
        }

        case 40: {
          _.merge(updatedState, {
            selectedItemIndex: Math.min(selectedItemIndex + 1, filteredItems.length - 1),
          });

          break;
        }

        case 27: {
          _.merge(updatedState, {
            filteredItems: [],
          });

          break;
        }

        case 9: {
          this.onBlur();
          this.focusNextInput();

          break;
        }
      }

      this.setState(updatedState);
    }
  }

  onBlur() {
    const {
      state: {
        chosenItem,
        emptyResult,
        filteredItems
      },
      inputElem,
      timeoutBeforeShowingLoadingIcon,
      timeoutBeforeHiddingLoadingIcon
    } = this;

    clearTimeout(timeoutBeforeShowingLoadingIcon);
    clearTimeout(timeoutBeforeHiddingLoadingIcon);

    this.infoToShowAfterLoadingIcon = {};

    const firstFilteredItem = filteredItems[0];
    const filteredItemEqualInputValue = firstFilteredItem && firstFilteredItem.City === inputElem.value;

    const updatedState = _.merge(this.getInitialState(), {
      chosenItem: filteredItemEqualInputValue && firstFilteredItem || chosenItem,
    });

    if ((!chosenItem && !filteredItemEqualInputValue) || emptyResult) {
      _.merge(updatedState, {
        emptyInputError: true
      });
    }

    this.setState(updatedState);
  }

  onFocus() {
    const {
      state: {
        chosenItem
      },
      inputElem,
    } = this;

    this.isPristine = false;

    if (chosenItem) {
      inputElem.setSelectionRange(0, inputElem.value.length);
    } else {
      setTimeout(() => this.onChange(), 0)
    }

    this.setState({
      emptyInputError: false
    });
  }

  selectItem(itemIndex) {
    const {
      state: {
        filteredItems,
        chosenItem
      },
      inputElem
    } = this;

    const newChosenItem = filteredItems[itemIndex] || (chosenItem && chosenItem.City === inputElem.value && chosenItem);

    this.setState({
      selectedItemIndex: 0,
      filteredItems: [],
      hiddenItemsLength: 0,
      chosenItem: newChosenItem
    });

    inputElem.value = newChosenItem ? newChosenItem.City : inputElem.value;

    if (newChosenItem) {
      this.focusNextInput();
    }

    return newChosenItem;
  }

  focusNextInput() {
    const inputs = $('input');
    const nextInputIndex = inputs.index(this.inputElem) + 1;

    setTimeout(() => inputs.eq(nextInputIndex).focus(), 0);
  }

  onDocumentMouseDown(e) {
    if (!this.autocompleteWrapper.contains(e.target) && !this.isPristine) {
      this.onBlur();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      filteredItems,
      hiddenItemsLength,
      selectedItemIndex,
      emptyResult,
      emptyInputError,
      serverError,
      loadingData
    } = this.state;

    return filteredItems !== nextState.filteredItems
      || hiddenItemsLength !== nextState.hiddenItemsLength
      || selectedItemIndex !== nextState.selectedItemIndex
      || emptyResult !== nextState.emptyResult
      || emptyInputError !== nextState.emptyInputError
      || serverError !== nextState.serverError
      || loadingData !== nextState.loadingData
  }

  componentDidMount() {
    this.inputElem = document.querySelector('.autocomplete-wrapper__input');
    this.autocompleteWrapper = document.querySelector('.autocomplete-wrapper');

    document.addEventListener('mousedown', this.onDocumentMouseDown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMouseDown);
  }

  render() {
    const {
      state: {
        filteredItems,
        hiddenItemsLength,
        selectedItemIndex,
        emptyResult,
        emptyInputError,
        serverError,
        loadingData
      },
      selectItem,
      refreshSearching
    } = this;

    const showResult = !!filteredItems.length || emptyResult || serverError || loadingData;
    const errorMessage = emptyInputError && (
      <div className="autocomplete-wrapper__error-message">Выберите значение из списка</div>
    );

    return (
      <div className="autocomplete-wrapper">
        <Input emptyInputError={emptyInputError}
               onChange={this.onChangeDebounced}
               onKeyDown={this.onKeyDown}
               onFocus={this.onFocus}
        />

        {errorMessage}
        <SearchingResult visible={showResult}
                         loadingData={loadingData}
                         serverError={serverError}
                         emptyResult={emptyResult}
                         filteredItems={filteredItems}
                         hiddenItemsLength={hiddenItemsLength}
                         selectedItemIndex={selectedItemIndex}
                         selectItem={selectItem}
                         refreshSearching={refreshSearching}
        />
      </div>
    );
  }
}
