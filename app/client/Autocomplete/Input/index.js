import React from 'react';

export default class Input extends React.Component {
  render() {
    const {
      emptyInputError,
      onChange,
      onKeyDown,
      onFocus
    } = this.props;

    return (
      <input className={"autocomplete-wrapper__input" + (emptyInputError ? ' autocomplete-wrapper__input_error' : '')}
             onChange={onChange}
             onKeyDown={onKeyDown}
             onFocus={onFocus}
             placeholder="Начните вводить название"
      />
    );
  }
}
