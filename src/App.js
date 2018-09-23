import React, { Component } from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import './App.css';

import {randomName} from './RandomNames.js';

var shuffle = (array) => { //credit stackoverflow for this; im too lazy to write my own array shuffle
  let c = array.length;
  while (c > 0) {
      let index = Math.floor(Math.random() * c);
      c--;
      let temp = array[c];
      array[c] = array[index];
      array[index] = temp;
  }
  return array;
}

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
    aliases: {},
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
    },
    done: false,
  }

  randomNames() {
    for (let man of this.state.men) {
      this.add_alias(man, randomName("m"))
    }
    for (let woman of this.state.women) {
      this.add_alias(woman, randomName("f"))
    }
  }

  stepAlg() {
    if (this.state.done) {
      return
    }
    let new_matching = this.state.matching;
    let flag = true;
    for (let woman of Object.keys(this.state.matching.proposals)) {
      if (this.state.matching.proposals[woman].length < 1 || this.state.matching.proposals[woman].slice(-1)[0].length !== 1) {
        flag = false;
      }
    }
    if (flag) {
      this.setState({done: true})
      return
    }
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

  aliased_str(n) {
    if (this.state.aliases.hasOwnProperty(n)) {
      return this.state.aliases[n]
    }
    if (n.substring(0, 1) === "m") {
      return "♂" + n.substring(1);
    } else if (n.substring(0, 1) === "w") {
      return "♀" + n.substring(1);
    }
    return n
  }

  aliased(n) {
    if (this.state.aliases.hasOwnProperty(n)) {
      return this.state.aliases[n]
    }
    if (n.substring(0, 1) === "m") {
      return (<span>♂<sub>{n.substring(1)}</sub></span>);
    } else if (n.substring(0, 1) === "w") {
      return (<span>♀<sub>{n.substring(1)}</sub></span>);
    }
    return n
  }

  restart(value, resetPrefs, doweshuffle) {
    let men = [];
    let women = [];
    for (var i = 0; i < value; i++) {
      men.push("m" + (i+1));
      women.push("w" + (i+1));
    }

    let prefs = this.state.prefs;

    if (resetPrefs) {
      prefs = {
        men: {},
        women: {},
      }
    }

    let matching = {
      proposals: {},
      rejections: {},
      days: [],
    }
    
    for (let man of men) {
      if (resetPrefs) {
        var arr = women.slice(0);
        console.log(arr)
        if (doweshuffle) {
          shuffle(arr);
          console.log(arr)
        }

        prefs.men[man] = arr;
      }
      matching.rejections[man] = [];
    }

    for (let woman of women) {
      if (resetPrefs) {
        arr = men.slice(0);
        if (doweshuffle) {
          shuffle(arr);
        }
        prefs.women[woman] = arr;
      }
      matching.proposals[woman] = [];
    } 

    this.setState({
      n: value,
      men: men,
      women: women,
      prefs: prefs,
      matching: matching,
      done: false,
    }) // Components will rest INSIDE state. I think this works.
  }

  add_alias(old, n) {
    let new_aliases = this.state.aliases;
    new_aliases[old] = n;
    this.setState({aliases: new_aliases});
  }

  render() {
    return (
      <div>
        <div>
          n = <NumberChanger initial={3} callback={(value) => {
            if (value > 0 && value < 100) {
              this.restart(value, true, false);
            }
          }} />
        </div>
        <div>
          Men: {this.state.men.map((val, i) => {
            return (
              <InputChanger
                key={this.aliased_str(val)}
                parent={this}
                initial={this.aliased_str(val)} 
                callback={(value) => {this.add_alias(val, value)}}
              />
            )
          }).reduce((prev, curr) => [prev, ', ', curr])}
        </div>
        <div>
          Women: {this.state.women.map((val, i) => {
            return (
              <InputChanger 
                key={this.aliased_str(val)}
                parent={this}
                initial={this.aliased_str(val)} 
                callback={(value)=>{this.add_alias(val, value)}}
              />
            )
          }).reduce((prev, curr) => [prev, ', ', curr])}
        </div>
        
        <div>
          <button onClick={() => {this.randomNames()}}>Random Names</button>
        </div>

        <button onClick={this.stepAlg.bind(this)}>Step</button>
        <button onClick={() => {this.restart(this.state.n, false, false)}}>Restart</button>

        <table cellSpacing={0}>
          <tbody>
          <tr><td>Proposed</td>{this.state.matching.days.map((val, i) => {return <td>{"Day " + (i+1)}</td>})}</tr>
          {Object.keys(this.state.matching.proposals).map((key, index) => {
            return (
              <tr>
                <td>{this.aliased(key)}</td>
                {this.state.matching.proposals[key].map((group, i) => {
                  if (group.length < 1) {
                    return (<td></td>)
                  }
                  return (<td>{group.map((val, i) => {return this.aliased(val)}).reduce((prev, curr) => [prev, ', ', curr])}</td>)
                })}
              </tr>);
          })}
          </tbody>
        </table>

        <h4>
          Preferences<span> </span>
          <button onClick={() => {this.restart(this.state.n, true, true)}}>Randomize</button>
        </h4>

        {Object.keys(this.state.prefs.men).map((key, index) => {
          return (
            <div className="prefList">
              <div className="prefListTitle">{this.aliased(key)}</div>
              <SortableComponent 
                parent={this}
                key={this.state.n + JSON.stringify(this.state.prefs)} 
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

        <div style={{clear: "both"}}><hr /></div>

        {Object.keys(this.state.prefs.women).map((key, index) => {
          return (
            <div className="prefList">
              <div className="prefListTitle">{this.aliased(key)}</div>
              <SortableComponent 
                parent={this}
                key={this.state.n + JSON.stringify(this.state.prefs)} 
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

class InputChanger extends Component {
  constructor(props) {
    super();
    this.state = {value: props.initial};
  }

  onChange(event) {
    this.props.callback(event.target.value);
    this.setState({value: this.props.parent.aliased_str(event.target.value)})
  }

  render() {
    return (
      <input type="text" value={this.state.value} onChange={this.onChange.bind(this)} />
    )
  }
}

class NumberChanger extends Component {
  constructor(props) {
    super();
    this.state = {value: props.initial};
  }

  onChange(event) {
    this.props.callback(event.target.value);
    this.setState({value: event.target.value})
  }

  render() {
    return (
      <input type="number" value={this.state.value} onChange={this.onChange.bind(this)} />
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
