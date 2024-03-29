import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { selectFiles } from "../../store/reducers/filesSlice";
import { uploadFileEffect } from "../../effects/uploadFileEffect";

import { FileItem } from "./fileItem";
import GhostLoader from "../ghostLoader";

import { ReactComponent as ArrowIcon } from "../../assets/arrow_right.svg";
import { ReactComponent as CircleCloudIcon } from "../../assets/cloud_circle.svg";
import { ReactComponent as CirclePictureIcon } from "../../assets/picture_circle.svg";
import { ReactComponent as FileIcon } from "../../assets/file_draft.svg";

import style from "./style.module.css";

export const FilesSystemPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const uploadedFiles = useSelector(selectFiles);
  const [areFilesLoading, setAreFilesLoading] = useState(false);

  const onBackButtonClick = () => navigate(-1);

  const handleFileUpload = async (event) => {
    setAreFilesLoading(true);
    const files = event.target.files;
    await uploadFileEffect({ files, dispatch });
    setAreFilesLoading(false);
  };

  return (
    <div className={style.container}>
      <header className={style.filesHeader}>
        <button
          className={style.header__cancelBtnBlue}
          onClick={onBackButtonClick}>
          Back
        </button>
        <h2 className={`${style.header__title} ${style.centeredTitle}`}>
          Files System
        </h2>
      </header>
      <section className={style.wrapper}>
        <ul className={style.options}>
          <li className={style.options__item}>
            <button
              className={`${style.options__item__button} ${style.selectFileButton}`}>
              <CirclePictureIcon /> From Gallery{" "}
              <ArrowIcon className={style.arrowIcon} />
            </button>
            <input
              type="file"
              accept="image/*,video/*"
              className={style.hiddenInput}
              onChange={handleFileUpload}
              multiple
            />
          </li>
          <li className={style.options__item}>
            <button
              className={`${style.options__item__button} ${style.selectFileButton}`}>
              <CircleCloudIcon /> From Files{" "}
              <ArrowIcon className={style.arrowIcon} />
            </button>
            <input
              type="file"
              accept=".pdf,.doc,.txt,.zip,.rar"
              className={style.hiddenInput}
              onChange={handleFileUpload}
              multiple
            />
          </li>
        </ul>
        <p className={style.wrapper__list__title}>Recently sent files</p>
        {areFilesLoading ? (
          <div className={style.loaderWrapper}>
            <GhostLoader texts={["Uploading"]} />
          </div>
        ) : uploadedFiles.length ? (
          <ul className={`${style.options} ${style.filesList}`}>
            {uploadedFiles.map((file) => (
              <FileItem file={file} key={file.id} />
            ))}
          </ul>
        ) : (
          <div className={style.emptyFilesPage}>
            <FileIcon />
            <h2 className={style.emptyFilesPage_title}>Files not found</h2>
            <p className={style.emptyFilesPage_desc}>
              This page is empty. You have no uploaded files.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
