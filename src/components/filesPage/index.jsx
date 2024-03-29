import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import cn from "classnames";

import {
  changeDirection,
  changeFileView,
  selectDirection,
  selectFileView,
  selectFiles,
  selectSearchAutocomplete,
  setSearchAutocomplete,
} from "../../store/reducers/filesSlice";
import {
  autoCompleteSearchEffect,
  downloadFileEffect,
  getFileInfoEffect,
} from "../../effects/filesEffects";
import { useClickOutside } from "../../utils/useClickOutside";

import { FileItem } from "./fileItem";
import { Loader } from "../loader";
import CustomFileSmallIcon from "../customFileIcon/CustomFileSmallIcon";

import { ReactComponent as SearchIcon } from "../../assets/search_input.svg";
import { ReactComponent as GridIcon } from "../../assets/grid_view.svg";
import { ReactComponent as ListIcon } from "../../assets/list_view.svg";
import { ReactComponent as ArrowIcon } from "../../assets/arrow_up.svg";
import { ReactComponent as FileIcon } from "../../assets/file_draft.svg";

import style from "./style.module.css";

export const FilesPage = ({}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const files = useSelector(selectFiles);
  const searchFiles = useSelector(selectSearchAutocomplete);
  const dir = useSelector(selectDirection);
  const view = useSelector(selectFileView);
  const [checkedFiles, setCheckedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const isFileChecked = (id) => {
    return checkedFiles.some((file) => file.id === id);
  };
  const handleClickOutside = () => {
    setIsPopupOpen(false);
    setCheckedFiles((prevFiles) => prevFiles.filter((file) => !file.is_search));
  };

  useClickOutside(searchRef, handleClickOutside);

  const onBackButtonClick = () => navigate(-1);

  const onFileSelect = (file) => {
    if (isFileChecked(file.id)) {
      setCheckedFiles((files) => files.filter((el) => el.id !== file.id));
    } else {
      setCheckedFiles((files) => [...files, file]);
    }
  };

  const handleFileDownload = async () => {
    setLoading(true);
    for (const file of checkedFiles) {
      await downloadFileEffect(file);
    }
    setCheckedFiles([]);
    setLoading(false);
  };

  const onDirectionChange = () => {
    if (dir === "asc") {
      dispatch(changeDirection("desc"));
    } else {
      dispatch(changeDirection("asc"));
    }
  };

  const onFileViewChange = () => {
    if (view === "grid") {
      dispatch(changeFileView("list"));
    } else {
      dispatch(changeFileView("grid"));
    }
  };

  const handleInputChange = async (e) => {
    const query = e.target.value;
    dispatch(setSearchAutocomplete([]));
    await autoCompleteSearchEffect(query).then((data) => {
      if (data.length > 0) {
        setIsPopupOpen(true);
        dispatch(setSearchAutocomplete(data));
      } else {
        dispatch(setSearchAutocomplete([]));
      }
    });
  };

  const handleSearchClick = async (file) => {
    await getFileInfoEffect(file.slug).then((data) =>
      onFileSelect({ ...data, id: file.id, is_search: true })
    );
  };

  return (
    <div className={style.container}>
      <header className={style.header}>
        <button className={style.header__backBtn} onClick={onBackButtonClick}>
          Back
        </button>
        <h2 className={style.header__title}>Files</h2>
      </header>
      <div className={style.inputWrapper} ref={searchRef}>
        <SearchIcon className={style.inputWrapper__icon} />
        <input
          ref={inputRef}
          placeholder="Search"
          className={style.inputWrapper__input}
          onChange={handleInputChange}
        />
        {isPopupOpen && (
          <ul className={style.autocompleteWrapper}>
            {searchFiles.map((file) => (
              <li
                key={file.id}
                className={cn(style.options__item, style.fileItem)}
                onClick={() => {
                  handleSearchClick(file);
                }}>
                <input
                  className={cn(style.checkbox, style.checkbox__right)}
                  type="checkbox"
                  checked={isFileChecked(file.id)}></input>
                <div className={style.fileItem__icon}>
                  <CustomFileSmallIcon type={file.extension} />
                </div>
                <div>
                  <h3>{file.title}</h3>
                  <p>{file.updated}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={style.actionButtons}>
        <button
          className={cn(
            style.actionButtons__sort,
            dir === "desc" && style.descending__dir
          )}
          onClick={onDirectionChange}>
          Created
          <ArrowIcon />
        </button>
        <button
          className={style.actionButtons__view}
          onClick={onFileViewChange}>
          {view === "grid" ? <ListIcon /> : <GridIcon />}
        </button>
      </div>
      {files.length > 0 ? (
        <>
          <ul className={style.filesList}>
            {files.map((file) => (
              <FileItem
                file={file}
                isFileChecked={isFileChecked}
                callback={onFileSelect}
                key={file.id}
              />
            ))}
          </ul>
          {checkedFiles.length > 0 && (
            <button
              className={style.uploadBtn}
              onClick={handleFileDownload}
              ref={searchRef}>
              {loading ? <Loader /> : "Download"}
            </button>
          )}
        </>
      ) : (
        <>
          <div className={style.emptyFilesPage}>
            <FileIcon />
            <h2 className={style.emptyFilesPage_title}>Files not found</h2>
            <p className={style.emptyFilesPage_desc}>
              This page is empty, upload your first files.
            </p>
          </div>
          <button
            className={style.uploadBtn}
            onClick={() => navigate("/file-upload")}>
            Upload
          </button>
        </>
      )}
    </div>
  );
};
