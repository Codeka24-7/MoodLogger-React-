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

const moodTags = ["happy","sad","boring","curious","energetic","lazy","tired","fresh"];
const characterLimit = 21;

// helper resusable components
function DisplayTags({tags,max_width}){
  return(<div className="latest-mood-tag-container" style={{maxWidth:max_width}}>
      {tags.map((tag)=>(
        <span key={tag} className='latest-mood-tag'>{tag}</span>
      ))}
    </div>
  );
}

// helper resusable components
function DisplaySelectedTags({selectedTags,setSelectedTags}) {
  
  function removeTag(tag){
    setSelectedTags((prev)=>{
      return prev.filter((item)=>(item!==tag))
    })
  }

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

// I might need this dropdowwn in other places as well. So I am keeping it globally.
// tag is the input in the input box
// setTag is to set the input field when the user clicks on an item in the dropdown

function Dropdown({tag,setTag}){
  const filter = tag;
  let filtered;
  if(filter.length!==0) { filtered = moodTags.filter((item)=>(item.includes(filter)));}
  else {filtered = moodTags;}
  
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

// tag is the input typed, and setTag controls it. 
// changeTheField is the function for onChange for the input
// setShowDropdown is to show/hide the dropdown
// addTag is the button action associated with this input field.

function DropdownInput({tag,setTag,changeTheField,setShowDropdown,selectedTags,setSelectedTags}){
  
  function addTag(){
    if(tag.length===0) return; 
    if(!(moodTags.find((item)=>(item===tag)))) moodTags.push(tag);
    if(selectedTags.includes(tag)) return;
    setSelectedTags((prev)=>{
      return [...prev,tag];
    })
    setTag("");   
  }

  return (
    <div className="tag-input-container">
      <input id='tag-input' className='input-text-box' value={tag} 
      onChange={(e)=>{changeTheField(e,setTag)}} 
      onFocus={()=>{setShowDropdown(true)}}
      onBlur={()=>{setShowDropdown(false)}}/> 
      <span className='charCount'>{tag.length}/21</span>
      <button type="button" className='btn btn-primary'
      onClick={addTag}>
        Add</button>
    </div>
  );
}

// FullDropdown is the parent that manages the dropdown state 
// Since this state is controlled/used by two components , i will treat these two as child component for the parent.
// the shared states are: tag,  showDropdown
function FullDropdown({tag,setTag,selectedTags,setSelectedTags}){
  
  const [showDropdown,setShowDropdown] = useState(false);
  
  return(
    <>
      <DropdownInput {...{tag,setTag,changeTheField,setShowDropdown,selectedTags,setSelectedTags}}/>
      {showDropdown && <Dropdown {...{tag,setTag}}/>}   
    </>
  )
}

// I feel most of the state ownership is with this MoodForm. 
// Ideally it doesnt have to accept a lot of parameters.
function MoodForm({makeChange,preTyped="",preSelectedTags=[],firstLabel,secondLabel,children}){

  const [typed, setTyped] = useState(preTyped);
  const [selectedTags,setSelectedTags] = useState(preSelectedTags);
  const [tag, setTag] = useState("");

  function submit(e){
    e.preventDefault();
    if(typed.length===0) return;
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const id = now.getTime();
    makeChange({date,id,time,selectedTags,typed});
    setTyped("");
    setTag("");
    setSelectedTags([]);
  }

  return (
    <div className="mood-form-wrapper">
      {children && <div className="mood-form-close-area">{children}</div>}
      <form className="mood-form" autoComplete="off"
        onSubmit={(e)=>{submit(e)}}>
      {/* Tag Section */}
      <div className="tag-selector">
        <label forhtml='tag-input'>{firstLabel}</label>
        <FullDropdown selectedTags={selectedTags} setSelectedTags={setSelectedTags} tag={tag} setTag={setTag} />
        {selectedTags.length > 0 ? (
          <>
            <p>Tags Selected</p>
            <DisplaySelectedTags selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
          </>
        ) : (<p>No tags selected</p>)
        }
        
      </div>

      {/* Text Input Section */}
      <div className="form-group">
        <label htmlFor="strmood">{secondLabel}</label>
        <div className='inputWithCharCount'>
          <input id="strmood" className='input-text-box' type="text" placeholder="Morning Run,Didn't Sleep well..."
            value={typed} onChange={(e) =>changeTheField(e,setTyped)} />
          <span className='charCount'>{typed.length}/21</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button type="button" className="btn btn-secondary" onClick={()=>{resetText(setTyped)}}>
          Clear
        </button>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
    </div>
  )
}

// in general any text input would need this function for onChange, so keeping this function globally
function changeTheField(e,setText){
  const inputStr = e.target.value;
  const inputLen = inputStr.length;
  if(inputLen <= characterLimit) setText(inputStr);
}

// in general any input can have a clear button, so keeping this function globally
function resetText(setTyped){
  setTyped("");
}

// after refactor a giant function became this much small !
const MoodLogger = React.memo(
  function MoodLogger({append}){
    const firstLabel = `Select the tags that describe your mood: `;
    const secondLabel = `What's contributing to your mood right now?`;
    return(
      <div className="mood-logger-card">
        <h2>Mood Logger</h2>
        <MoodForm makeChange={append} firstLabel={firstLabel} secondLabel={secondLabel}/>
      </div>
    );
  }
);

function MoodHistory({ moodHis, deleteEntry , editEntry}) {
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


function LatestMood({moodHis}){
    
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

function ConfirmDelete({showDelModal,setShowDelModal,deleteAfterConfirmed}){

  if(showDelModal.showNow){
    return (
      <div className='modal'>
        <p>Do you want to delete the entry?</p>
        <p>This action cannot be undone!</p>
        <div className='del-confirm-btn-grp'>
            <button className='btn-action cancel-btn' onClick={()=>(setShowDelModal({showNow:false,date:"",id:""}))}>Cancel</button>
            <button className='btn-action confirm-btn' onClick={()=>deleteAfterConfirmed(showDelModal.date,showDelModal.id)}>Confirm</button>
        </div>
      </div>
    );
  }
}

function EditEntryModal({showEditModal,editEntryWithChanges,setShowEditModal,moodHis}){
  const {idx,date} = showEditModal;
  const {id,time,moodState,tags:[...tagArray]} = moodHis[date][idx];
  const firstLabel = `Select the tags that described your mood: `;
  const secondLabel = `What wass contributing to your mood? `
  return(
    <div className="edit-modal modal">
      <h2>Edit the entry</h2>
      <MoodForm className="edit-moodform" makeChange={editEntryWithChanges} preTyped={moodState} preSelectedTags={tagArray}>
        <button type="button" id="close-edit-modal" className="btn-action cancel-btn" onClick={()=>{setShowEditModal({showNow:false,date:"",idx:""})}}>Cancel</button>
      </MoodForm>
    </div>
  );
}

function ListManager(){
  
  // moodHis is an object containing date as a key and array of objects as value. value: [{id,time,tags,moodState},{},....]
  let [moodHis,setMoodHis] = useState({});

// ------------------ append

  const append = useCallback(({date,id,time,selectedTags:tags,typed:moodState}) => {
    setMoodHis((prev) => {
      const updated = {...prev}; // without spread, the updated and prev will share the same address.
      
      if(!updated[date]) updated[date] = [];
      else updated[date] = [...prev[date]]; // give same spread operation treatment to ensure true copy
      
      updated[date].push({id,time,tags,moodState});
      return updated;
    });
  } , []);

// ------------------ delete

  const [showDelModal,setShowDelModal] = useState({showNow:false,date:"",id:""});

  function deleteAfterConfirmed(date,idDel){ 
    
    setShowDelModal({showNow:false,date:"",id:""});

    const updated = moodHis[date].filter(({id})=>(id!==idDel) )
    const {[date]:_,...rest} = moodHis;
    const final = (updated.length===0)?{...rest}:{...rest,[date]:updated};
    setMoodHis(final);
  }

  function deleteEntry(date,id){
    setShowDelModal({showNow:true,date,id});
  }
// ------------------ edit
  const [showEditModal,setShowEditModal] = useState({showNow:false,date:"",idx:""});

  function editEntry(date,id){
    const idx = moodHis[date].findIndex((obj)=>(obj.id===id));
    setShowEditModal({showNow:true,date,idx});
  }
  
  function editEntryWithChanges({selectedTags:NewTags,typed:NewMoodState}){
    const {idx,date} = showEditModal;
    const final = {...moodHis};
    const updated = {...moodHis[date][idx],tags:NewTags,moodState:NewMoodState};
    final[date][idx] = updated;
    setMoodHis(final);
    setShowEditModal({showNow:false,date:"",idx:""});
  }
// ---------------- return
  return (
    <main className='home-section'>
      <MoodLogger append={append} />
      <div className="mood-history-container">
        <MoodHistory moodHis={moodHis} deleteEntry={deleteEntry} editEntry={editEntry} />
      </div>
      <LatestMood moodHis={moodHis}/>
      <ConfirmDelete {...{showDelModal,setShowDelModal,deleteAfterConfirmed}}/>
      {showEditModal.showNow && <EditEntryModal {...{showEditModal,editEntryWithChanges,setShowEditModal,moodHis}}/>}
    </main>
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