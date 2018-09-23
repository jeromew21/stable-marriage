import React, { Component } from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import './App.css';

class App extends Component {
  state = {
    n: 3, 
    draggables: [
      <SortableComponent length={3} />,
      <SortableComponent length={3} />,
      <SortableComponent length={3} />,
    ],
    men: ["m1", "m2", "m3"],
    women: ["w1", "w2", "w3"],
    prefs: {
      men: {
        m1: ["w1", "w2", "w3"],
        m2: ["w1", "w2", "w3"],
        m3: ["w1", "w2", "w3"],
      },
      women: {
        w1: ["m1", "m2", "m3"],
        w2: ["m1", "m2", "m3"],
        w3: ["m1", "m2", "m3"],
      }
    },
    matching: {
      proposals: {
        w1: [],
        w2: [],
        w3: [],
      },
      rejections: {
        m1: [],
        m2: [],
        m3: [],
      }
    }
  }

  render() {
    return (
      <div>
        <div>
          n = {this.state.n}
          <NumberChanger callback={(value) => {
            if (value > 0 && value < 100) {
              let men = [];
              let women = [];
              for (var i = 0; i < value; i++) {
                men.push("m" + (i+1));
                women.push("w" + (i+1));
              }

              let prefs = {
                men: {},
                women: {},
              }
              
              for (let man of men) {
                prefs.men[man] = women.slice(0)
              }

              for (let woman of women) {
                prefs.women[woman] = men.slice(0)
              }

              this.setState({
                n: value,
                men: men,
                women: women,
                prefs: prefs,
              }) // Components will rest INSIDE state. I think this works.
            }
          }} />
          {JSON.stringify(this.state.prefs)}
        </div>
        <div>
          Men: {this.state.men.join(", ")}
        </div>
        <div>
          Women: {this.state.women.join(", ")}
        </div>
        {Object.keys(this.state.prefs.men).map((key, index) => {
          return (
            <div>
              {key}
              <SortableComponent 
                key={this.state.n + "" + key + "" + index} 
                items={this.state.prefs.men[key]}
                callback={(o, n) => {
                  let new_prefs = this.state.prefs;
                  new_prefs.men[key] = arrayMove(new_prefs.men[key], o, n);
                  this.setState({prefs: new_prefs})
                  console.log("hii")
                }}
              />
            </div>
          )
        })}
      </div>
    );
  }
}

class NumberChanger extends Component {
  onChange(event) {
    this.props.callback(event.target.value)
  }

  render() {
    return (
      <div>
        <input type="number" onChange={this.onChange.bind(this)} />
      </div>
    )
  }
}

const SortableItem = SortableElement(({value}) =>
  <li>{value}</li>
);

const SortableList = SortableContainer(({items}) => {
  return (
    <ol>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </ol>
  );
});

class SortableComponent extends Component {
  constructor(props) {
    super()
    this.state = {
      items: props.items
    }
  }

  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex),
    });
    this.props.callback(oldIndex, newIndex)
  }

  render() {
    return <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />;
  }
}

export default App;
