import React from 'react';
import './Bookmarks.css';

const conf = require('./widgetconfig.json');

export  default class Bookmarks extends React.Component {

  constructor(props) {
    super(props);

    this.state = {value:'', view:props.view};

    this.handleChange = this.handleChange.bind(this);
    this.handleAddBookmark = this.handleAddBookmark.bind(this);
    this.handleZoomtoExtent = this.handleZoomtoExtent.bind(this);
    this.handleRemoveBookmark = this.handleRemoveBookmark.bind(this);

    
  }

  componentDidMount(){

    this.addConfigBookmarks();
    this.addStorageBookmarks();
  }

  addConfigBookmarks(){


    let bookmarks = conf.bookmarks;

    for (var i = 0 ; i < bookmarks.length; i++)
    {

      this.addBookmarkObject(bookmarks[i])
    }

  }

  addStorageBookmarks(){

    if (localStorage.local_bookmarks === undefined)
    {
      localStorage.setItem("local_bookmarks",JSON.stringify([]));
    }

    else{

      let bookmarks = JSON.parse(localStorage.local_bookmarks);

      for (var i = 0 ; i < bookmarks.length; i++)
      {

        this.addBookmarkObject(bookmarks[i])
      }
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  addBookmarkObject(bookmark){

    let ul, li, spanzoom, spandelete, center, zoom;

    ul = document.getElementById("BookmarksList");

    li = document.createElement("li");
    spanzoom = document.createElement("span");
    spandelete = document.createElement("span");
    center = JSON.stringify(bookmark.center);
    zoom = bookmark.zoom;

    li.setAttribute("id", "bookmark_"+ bookmark.value);
    li.className += "bookmarksLi";
    spanzoom.setAttribute("center", center);
    spanzoom.setAttribute("zoom", zoom);

    spanzoom.className += "glyphicon glyphicon-zoom-in bookmarks-glyphicon";
    spandelete.className += "glyphicon glyphicon-remove bookmarks-glyphicon";
    spanzoom.addEventListener("click", this.handleZoomtoExtent);
    spandelete.addEventListener("click", this.handleRemoveBookmark);

    li.appendChild(document.createTextNode(bookmark.value));
    li.appendChild(spandelete);
    li.appendChild(spanzoom);
    ul.insertBefore(li, ul.firstChild);

  }

  handleAddBookmark(event) {
    let ul, input, li, spanzoom, spandelete, center, zoom;

    ul = document.getElementById("BookmarksList");
    input = document.getElementById("BookmarksInput");
    li = document.createElement("li");
    spanzoom = document.createElement("span");
    spandelete = document.createElement("span");
    center = JSON.stringify(this.state.view.center.toJSON());
    zoom = this.state.view.zoom;

    this.saveBookMark({center: JSON.parse(center), zoom: zoom, value:this.state.value});

    li.setAttribute("id", "bookmark_"+ this.state.value);
    li.className += "bookmarksLi";
    spanzoom.setAttribute("center", center);
    spanzoom.setAttribute("zoom", zoom);

    spanzoom.className += "glyphicon glyphicon-zoom-in bookmarks-glyphicon";
    spandelete.className += "glyphicon glyphicon-remove bookmarks-glyphicon";
    spanzoom.addEventListener("click", this.handleZoomtoExtent);
    spandelete.addEventListener("click", this.handleRemoveBookmark);
    li.appendChild(document.createTextNode(this.state.value));
    li.appendChild(spandelete);
    li.appendChild(spanzoom);
    ul.insertBefore(li, ul.firstChild);
    input.value = "";
    event.preventDefault();
  }

  saveBookMark(bookmark){

    let bookmarks = JSON.parse(localStorage.local_bookmarks);
    bookmarks.push(bookmark);
    localStorage.setItem("local_bookmarks",JSON.stringify(bookmarks));

  }

  handleZoomtoExtent(click) {
    let center, zoom;

    center = JSON.parse(click.target.getAttribute("center"));
    zoom = click.target.getAttribute("zoom");
    let view = this.state.view;
    view.center = center;
    view.zoom = zoom;
    this.setState({view: view});

  }

  handleRemoveBookmark(click) {
    let target;

    target = click.target.parentNode;
    target.remove(target.selectedIndex);
    let bookmarkname = target.id.split("_")[1];
    this.removeLocalBookmarkByName(bookmarkname);
  }

  removeLocalBookmarkByName(bookmarkname){

    let bookmarks = JSON.parse(localStorage.local_bookmarks);

    for (var i = 0; i < bookmarks.length; i++){

      if(bookmarks[i].value === bookmarkname){

        bookmarks.splice(i,1);
      }
    }

    localStorage.setItem("local_bookmarks", JSON.stringify(bookmarks));

  }

  render(){
    return(
      <div className='Bookmarks'>
        <ul id="BookmarksList">
          <li className="bookmarksLiInput"><input id="BookmarksInput" type="text" value={this.state.value} onChange={this.handleChange}/><span onClick={this.handleAddBookmark} className="glyphicon glyphicon-pushpin bookmarks-glyphicon"></span></li>
        </ul>
      </div>
    );
  }
}
