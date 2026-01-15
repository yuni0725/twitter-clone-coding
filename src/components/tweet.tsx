import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ChangeEvent, useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  margin-right: 5px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const ButtonDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PhotoDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: #4cbd42;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const ChangeFileDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChangeFileButton = styled.label`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 0px;
  text-transform: uppercase;
  text-align: center;
  border-radius: 5px;
  width: 100px;
  cursor: pointer;
`;

const ChangeFileInput = styled.input`
  display: none;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 10px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  height: 60%;
  resize: none;
  margin: 10px 0px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>("");

  const [fileEditing, setFileEditing] = useState(false);
  const [newFile, setNewFile] = useState<File>();

  useEffect(() => {
    setValue(tweet);
  }, [tweet]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const onNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e?.target;
    if (files && files.length === 1 && files[0].size < 1024 * 1024) {
      setNewFile(files[0]);
      setFileEditing(true);
      onFileChange();
    } else {
      alert("Image size should be smaller than 1MB");
    }
  };

  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    if (user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const onEdit = async () => {
    if (user?.uid !== userId) return;
    if (editing) setEditing(false);
    setEditing(true);
    try {
      await updateDoc(doc(db, "tweets", id), { tweet: value });
    } catch (e) {
      console.log(e);
    } finally {
      setEditing(false);
    }
  };

  const onFileChange = async () => {
    if (user?.uid !== userId) return;
    console.log("alsd");
    if (fileEditing && newFile) {
      const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
      await deleteObject(photoRef);
      console.log(photoRef);
      const result = await uploadBytes(photoRef, newFile);
      const url = await getDownloadURL(result.ref);
      await updateDoc(doc, {
        photo: url,
      });
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {editing ? (
          <TextArea onChange={onChange} value={value}></TextArea>
        ) : (
          <Payload>{tweet}</Payload>
        )}
        {user?.uid === userId ? (
          <ButtonDiv>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={onEdit}>
              {editing ? "Submit" : "Edit"}
            </EditButton>
          </ButtonDiv>
        ) : null}
      </Column>
      <Column>
        {photo ? (
          <ChangeFileDiv>
            <Photo src={photo} />
            <ChangeFileButton htmlFor="changeFile">Edit File</ChangeFileButton>
            <ChangeFileInput
              onChange={onNewFileChange}
              type="file"
              id="changeFile"
              accept="image/*"
            ></ChangeFileInput>
          </ChangeFileDiv>
        ) : null}
      </Column>
    </Wrapper>
  );
}
