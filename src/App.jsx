import React, { useState , useEffect , useCallback } from 'react';
import './App.css';

function QuoteBlock(){
  return(
    <div className="quote-block">
      <span className="quote-badge">Daily Quote</span>
      <blockquote className="quote-text">
        "Problem arises because of two things: Acting without thinking or Thinking without acting"
      </blockquote>
    </div>
  );
}


function DisplayTags({tags,max_width}){
  console.log("inside display tags",tags)
  return(<div className="latest-mood-tag-container" style={{maxWidth:max_width}}>
      {tags.map((tag)=>(
        <span key={tag} className='latest-mood-tag'>{tag}</span>
      ))}
    </div>
  );
}
  
const moodTags = ["happy","sad","boring","curious","energetic","lazy","tired","fresh"];

const MoodLogger = React.memo(
  function MoodLogger({append}){
    
    // console.log("MoodLogger is Rendered");

    const characterLimit = 21;

    const [typed, setTyped] = useState("");
    const [charCount, setCount] = useState(0);

    const [tag, setTag] = useState("");
    const [charTCount, setTCount] = useState(0);

    const [selectedTags,setSelectedTags] = useState([]);

    const [showDropdown,setShowDropdown] = useState(false);
    const [newTagDetected,setNewTagDetected] = useState(false);
    
    function changeTheField(e,setText,setCnt){
      const inputStr = e.target.value;
      const inputLen = inputStr.length;
      if(inputLen <= characterLimit) {
        setText(inputStr)
        setCnt(inputStr.length);
      }
    }

    function submit(e){
      e.preventDefault();
      if(typed.length===0) return;
      // console.log(`Your Response is Logged: ${typed}`);
      // console.log("Tags selected:",selectedTags);
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();
      append(date,now.getTime(),time,selectedTags,typed);
      setTyped("");
      setSelectedTags([]);
    }

    function resetText(){
      setTyped("");
    }
    
    function addTag(){
      if(tag.length===0) return; 
      if(newTagDetected) moodTags.push(tag);
      setNewTagDetected(false);
      setSelectedTags((prev)=>{
        const updated = [...prev];
        updated.push(tag);
        setTag("");
        return updated;
      })
    }

    function removeTag(tag){
      setSelectedTags((prev)=>{
        return prev.filter((item)=>(item!==tag))
      })
    }

    function Dropdown({filter}){
      // console.log("Displaying the dropwdown",moodTags);
      let filtered;
      if(tag.length!==0) { filtered = moodTags.filter((item)=>(item.includes(filter)));}
      else {filtered = moodTags;}
      if(filtered.length===0) setNewTagDetected(true);
        return(
          <div className="dropdown-container">
            <ul className="dropdown-list">
              {filtered.map((item) => (
                <li key={item} className="dropdown-item">
                  <button type="button" onMouseDown={() => setTag(item)}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
      )
    }

    function DisplaySelectedTags() {
      return (
        <div className="selected-tags-container">

          {selectedTags.map((tag) => (
            <button 
              key={tag} 
              type="button" 
              className="tag-pill"
              onClick={() => removeTag(tag)}
            >
              <span>{tag}</span>
              <span className="tag-remove-icon">&times;</span>
            </button>
          ))}
        </div>
      );
    }


    return(
  <div className="mood-logger-card">
    <h2>Mood Logger</h2>
    
    <form className="mood-form" onSubmit={submit}>
      {/* Tag Section */}
      <div className="tag-selector">
        <label forhtml='tag-input'>Select the tags that describe your mood: </label>
        <div className="tag-input-container">
          <input id='tag-input' className='input-text-box' value={tag} 
          onChange={(e)=>{changeTheField(e,setTag,setTCount)}} 
          onFocus={()=>{setShowDropdown(true)}}
          onBlur={()=>{setShowDropdown(false)}}/> 
          <span className='charCount'>{tag.length}/21</span>
          <button type="button" className='btn btn-primary'
          onClick={addTag}>
            Add</button>
        </div>
        {showDropdown && <Dropdown filter={tag}/>}
        {selectedTags.length > 0 ? (
          <>
            <p>Tags Selected</p>
            <DisplaySelectedTags/>
          </>
        ) : (
          <p>No tags selected</p>
        )}
        
      </div>

      {/* Text Input Section */}
      <div className="form-group">
        <label htmlFor="strmood">What's contributing to your mood right now?</label>
        <div className='inputWithCharCount'>
          <input id="strmood" className='input-text-box' type="text" placeholder="Morning Run,Didn't Sleep well..."
            value={typed} onChange={(e) =>changeTheField(e,setTyped,setCount)} />
          <span className='charCount'>{typed.length}/21</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button type="button" className="btn btn-secondary" onClick={resetText}>
          Clear
        </button>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  </div>
    );
  }

);

function MoodHistory({ moodHis, deleteEntry , editEntry}) {
  // console.log("Displaying the entry",moodHis);
  if (Object.keys(moodHis).length === 0) {
    return (
        <p>No entries logged yet!</p>
    );
  }

  return (
      <>
        <h3 className="mood-history-title">Mood History</h3>
        
        {Object.entries(moodHis).map(([date, entries]) => (
          <div key={date} className="mood-date-group">
            <h4 className="mood-date-header">{date}</h4>
            
            <ul className="mood-entries-list">
              {entries.map(({time,moodState,tags,id}) => (
                <li key={time} className="mood-entry-card">
                  
                  <div className="mood-entry-info">
                    <span className="mood-time">{time}</span>
                    <DisplayTags tags={tags} max_width={"200px"} />
                    <span className="mood-state">"{moodState}"</span>
                  </div>
                  
                  <div className="mood-entry-actions">
                    <button className="btn-action edit-btn" 
                      onClick={() => editEntry(date,id)}>
                      Edit 
                    </button>
                    <button className="btn-action delete-btn" 
                      onClick={() => deleteEntry(date,id)}>
                      Delete
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          </div>
        ))}
      </>      
    );
}

function ListManager(){
  // this will change when we integrate with a storage/DB.
  // instead of assigning empty list, we will fetch the previous data and assign it
  // moodHis is an object containing date as a key and array of objects as value. value: [{time,tags,moodState},{},....]
  let [moodHis,setMoodHis] = useState({});

  // Below code for append was to ensure that the reference of the append remains the same
    // To create one such , we need a deeper understanding of how closures work for the object where the function stores a reference of object in the first render.
        // i.e , moodHis is always pointing to the initial moodHis created unless we change it manually by `moodHis = updated`
        // Ended  up updating two moodHis (one that the function remembers and another is the actual moodHis of the current render)

  // const append = useCallback((date,time,tags,moodState) => {
  //   const updated = {...moodHis};
  //   console.log("before update",moodHis,updated);
  //   if(!updated[date]){
  //     updated[date] = [];
  //   }
  //   updated[date].push({time,tags,moodState});
  //   // check if this is correct based on my intention
  //   console.log("updated the emtry",updated);
  //   console.log("Are you both the same: ",updated===moodHis);
  //   setMoodHis(updated);
  //   moodHis = updated; // this is to update the moodHis that the function remembers. 
  //   console.log("moodHis after update ",moodHis);
  //   // setMoodHis will update the state of the moodHis that is available to parent ...
  // }, []);


  // below code is the basic version of the append

  // function append(date,time,tags,moodState){
  //   const updated = {...moodHis}; // without spread, the updated and moodHis will share the same address.
  //   console.log("before update",moodHis,updated);
  //   if(!updated[date]){
  //     updated[date] = [];
  //   }
  //   updated[date].push({time,tags,moodState});
  //   // check if this is correct based on my intention
  //   console.log("updated the emtry",updated);
  //   console.log("Are you both the same: ",updated===moodHis);
  //   setMoodHis(updated);
    
  // }

  // below code of append doesnt depend on the moodHis that the function remembers from the initial render. 
    // instead we are going to use the setterFunction features
  
  const append = useCallback((date,id,time,tags,moodState) => {
    setMoodHis((prev) => {
      const updated = {...prev};
      // problem wasnt with the if part.
      // so create an else part and work 
      if(!updated[date]){
        updated[date] = [];
      }
      else{
        // give same spread operation treatment to ensure true copy
        updated[date] = [...prev[date]];
      }
      updated[date].push({id,time,tags,moodState});
      return updated;
    });
  } , []);

  
  const [showModal,setShowModal] = useState({showNow:false,date:"",id:""});

  function deleteAfterConfirmed(date,idDel){ 
    // console.log(date,idDel);
    setShowModal({showNow:false,date:"",id:""});
    const updated = moodHis[date].filter(({id})=>(id!==idDel) )
    // console.log("updated in del",updated);
    const {[date]:val,...rest} = moodHis;
    const final = (updated.length===0)?{...rest}:{...rest,[date]:updated};
    // console.log("After Deletion",final);
    setMoodHis(final);
  }

  function deleteEntry(date,id){
    // console.log(date,id);
    setShowModal({showNow:true,date,id});
  }
  
  function ConfirmDelete(){

    if(showModal.showNow){
      return (
        <div className='Del-Confirm-Modal'>
          <p>Do you want to delete the entry?</p>
          <p>This action cannot be undone!</p>
          <div className='del-confirm-btn-grp'>
              <button className='btn-action cancel-btn' onClick={()=>(setShowModal({showNow:false,date:"",id:""}))}>Cancel</button>
              <button className='btn-action confirm-btn' onClick={()=>deleteAfterConfirmed(showModal.date,showModal.id)}>Confirm</button>
          </div>
        </div>
      );
    }
  }

  function LatestMood(){
    
    const now = new Date();
    const date = now.toLocaleDateString();

    if (Object.keys(moodHis).length === 0 || !moodHis[date] || moodHis[date].length === 0) {
      return (
        <div className='latest-mood-container empty'>
          <h3>Latest update today</h3>
          <p className="empty-msg">No mood logged yet today!</p>
          <span className="sub-text">Log your mood above to track how you feel.</span>
        </div>
      );
    }

    const {time,tags,moodState} = moodHis[date].at(-1);

    return (
      <div className="latest-mood-container">
        <h3 className="latest-title">Latest Mood Today</h3>
        <p className="latest-state">"{moodState}"</p>
        <DisplayTags tags={tags} max_width={"280px"}/>
        <span className="latest-time">Logged at {time}</span>
      </div>
    );
  }

  const [showEditModal,setShowEditModal] = useState({showNow:false,date:"",id:""});

  function editEntry(date,id){
    setShowEditModal({showNow:true,date,id});
  }

  function editEntryWithChanges(date,id,tags,moodState){
    setShowEditModal({showNow:false,date:"",id:""});
    setMoodHis((prev)=>{
      
      let updated={},index=0;
      const final = {...moodHis};
      
      moodHis[date].forEach(element => {
        if(element.id===id){
          updated = {id:element.id,time:element.time};
          index++;
          return;
        }
      });

      updated = {...updated,tags,moodState};
      
      final[date][index] = updated;
      setMoodHis(final);

    })
  }

  function EditEntryModal(){
    
    return(
      <div className="edit-modal">
        <div className="edit-model-previous">
          
        </div>
        <div className="edit-model-next">

        </div>
      </div>
    )
  }

  // console.log("re rendering the listmanager and the children");
  return (
    <main className='home-section'>
      <MoodLogger append={append} />
      <div className="mood-history-container">
        <MoodHistory moodHis={moodHis} deleteEntry={deleteEntry} editEntry={editEntry} />
      </div>
      <LatestMood/>
      <ConfirmDelete/>
    </main>
  )

}


function simulateFetch(){

    const datbase = {"cat":"Cat meows","dog":"Dog barks"};
    const timetaken = {"cat":7000,"dog":1000};

    const [query, setQuery] = useState("");
    const [result, setResult] = useState("");

    let ignore = false;

    function FetchDetails(){

        setTimeout(()=>{
          if(!ignore) setResult(datbase[query]);
        },timetaken[query]);
      
    }

    useEffect(()=>{
      FetchDetails();
      return(()=>{ignore=true;})
    },[query]);

    return(
      <div className="searchbox" style={{margin:"10px"}}>
        <label htmlFor='search'>SearchBox </label>
        <input type="text" id="search" value={query} onChange={(e)=>setQuery(e.target.value)} /> 
        <p>{`Result : ${result}`}</p>
      </div>
    )

}

// Navbar right now is there for just showing how much space is needed . 
function Navbar(){
  return(
    <nav>
      <ul>
        <li>Home</li>
        <li>Trend</li>
        <li id="supportLink">Support</li>
        <li>Upgrade</li>
        <li>Contact</li>
      </ul>
    </nav>
  )
}

function App() {
    
    return (
        <>
          <Navbar/>
          <QuoteBlock/>
          <ListManager/>
        </>
    );
}

export default App;