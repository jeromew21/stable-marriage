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
    aliases: {
      m1: "Brad"
    },
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
      },
      days: [],
    }
  }

  stepAlg() {
    let new_matching = this.state.matching;
    new_matching.days.push("day")
    for (let woman of Object.keys(this.state.matching.proposals)) {
      new_matching.proposals[woman].push([]);
    }
    for (let man of this.state.men) {
      for (let woman of this.state.prefs.men[man]) {
        if (!this.state.matching.rejections[man].includes(woman)) {
          new_matching.proposals[woman].slice(-1)[0].push(man);
          break; //proposal complete
        }
      }
    }
    for (let woman of Object.keys(this.state.matching.proposals)) {
      let suitors = new_matching.proposals[woman].slice(-1)[0];
      //Find the best man
      let best_man = "";
      for (let man of this.state.prefs.women[woman]) {
        if (suitors.includes(man)) {
          best_man = man;
          break;
        }
      }
      //Reject everyone else
      for (let man of suitors) {
        if (man !== best_man) {
          new_matching.rejections[man].push(woman);
        }
      }
    }
    this.setState({matching: new_matching});
  }

  aliased(n) {
    if (this.state.aliases.hasOwnProperty(n)) {
      return this.state.aliases[n]
    }
    return n
  }

  render() {
    return (
      <div>
        <h3>Stable Marriage /// Gale Shapley Algorithm</h3>
        <div>
          n = <NumberChanger initial={3} callback={(value) => {
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

              let matching = {
                proposals: {},
                rejections: {},
                days: [],
              }
              
              for (let man of men) {
                prefs.men[man] = women.slice(0)
                matching.rejections[man] = [];
              }

              for (let woman of women) {
                prefs.women[woman] = men.slice(0)
                matching.proposals[woman] = [];
              }

              this.setState({
                n: value,
                men: men,
                women: women,
                prefs: prefs,
                matching: matching
              }) // Components will rest INSIDE state. I think this works.
            }
          }} />
        </div>
        <div>
          Men: {this.state.men.map((val, i) => {return this.aliased(val)}).join(", ")}
        </div>
        <div>
          Women: {this.state.women.map((val, i) => {return this.aliased(val)}).join(", ")}
        </div>
        <button onClick={this.stepAlg.bind(this)}>Step</button>

        <table cellSpacing={0}>
          <tbody>
          <tr><td>Woman</td>{this.state.matching.days.map((val, i) => {return <td>{"Day " + (i+1)}</td>})}</tr>
          {Object.keys(this.state.matching.proposals).map((key, index) => {
            return (
              <tr>
                <td>{key}</td>
                {this.state.matching.proposals[key].map((group, i) => {
                  return (<td>{group.join(", ")}</td>)
                })}
              </tr>);
          })}
          </tbody>
        </table>

        <h4>Preferences</h4>
        <div><button>Randomize</button></div>

        {Object.keys(this.state.prefs.men).map((key, index) => {
          return (
            <div className="prefList">
              <div className="prefListTitle">{key}</div>
              <SortableComponent 
                parent={this}
                key={this.state.n + "" + key + "" + index} 
                items={this.state.prefs.men[key]}
                callback={(o, n) => {
                  let new_prefs = this.state.prefs;
                  new_prefs.men[key] = arrayMove(new_prefs.men[key], o, n);
                  this.setState({prefs: new_prefs})
                }}
              />
            </div>
          )
        })}

        {Object.keys(this.state.prefs.women).map((key, index) => {
          return (
            <div className="prefList">
              <div className="prefListTitle">{key}</div>
              <SortableComponent 
                parent={this}
                key={this.state.n + "" + key + "" + index} 
                items={this.state.prefs.women[key]}
                callback={(o, n) => {
                  let new_prefs = this.state.prefs;
                  new_prefs.women[key] = arrayMove(new_prefs.women[key], o, n);
                  this.setState({prefs: new_prefs})
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
      <input type="number" value={this.props.initial} onChange={this.onChange.bind(this)} />
    )
  }
}

const SortableItem = SortableElement(({value, parent}) =>
  <li className="prefListItem">{parent.aliased(value)}</li>
);

const SortableList = SortableContainer(({items, parent}) => {
  return (
    <ol className="prefListList">
      {items.map((value, index) => (
        <SortableItem parent={parent} key={`item-${index}`} index={index} value={value} />
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
    return <SortableList parent={this.props.parent} items={this.state.items} onSortEnd={this.onSortEnd} />;
  }
}

export default App;
