// tslint:disable:variable-name
import { h } from "preact";
import * as db from "./db";
import * as types from "./types";
import { URL } from "./util";

export function Loading(props) {
  return (
    <div class="notification-screen">
      <div class="notification-container">
        <h1>Loading</h1>
      </div>
    </div>
  );
}

export function PropelLogo(props) {
  let Subtitle = null;
  if (props.subtitle) {
    Subtitle = (
      <h2>
        <a href={props.subtitleLink || "/"}>{props.subtitle}</a>
      </h2>
    );
  }
  return (
    <div class="propel-logo">
      <div class="logo">
        <svg
          height={24}
          viewBox="0 0 24 24"
          width={24}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx={12} cy={12} r={12} />
        </svg>
      </div>
      <div class="global-title">
        <div class="global-main-title">
          <h1>
            <a href="/">Propel</a>
          </h1>
        </div>
        <div class="global-sub-title">{Subtitle}</div>
      </div>
    </div>
  );
}

export function Footer(props) {
  return (
    <div class="footer">
      <a href="/references">References</a>
      <a href="/docs">Documentation</a>
      <a href="https://github.com/propelml/propel">GitHub</a>
      <a href="mailto:propelml@gmail.com">Contact</a>
    </div>
  );
}

export function GlobalHeader(props) {
  return (
    <header>
      <div class="global-header">
        <div class="global-header-inner">
          <PropelLogo
            subtitle={props.subtitle}
            subtitleLink={props.subtitleLink}
          />
          <div class="global-header-right">{props.children}</div>
        </div>
      </div>
    </header>
  );
}

export function UserMenu(props) {
  if (props.userInfo) {
    return (
      <div class="dropdown">
        <Avatar size={32} userInfo={props.userInfo} />
        <div class="dropdown-content">
          <a href="#" onClick={db.active.signOut}>
            Sign out
          </a>
        </div>
      </div>
    );
  }
  return (
    <a href="#" onClick={db.active.signIn}>
      Sign in
    </a>
  );
}

export function Avatar(props: { size?: number; userInfo: types.UserInfo }) {
  const size = props.size || 50;
  const photo = new URL(props.userInfo.photoURL, window.location.href);
  photo.searchParams.set("size", size);
  return (
    <img
      class="avatar"
      height={size}
      src={photo.href}
      width={size}
    />
  );
}

// Trims whitespace.
export function normalizeCode(code: string): string {
  return code.trimRight();
}

export function UserTitle(props) {
  return (
    <div class="most-recent-header-title">
      <Avatar userInfo={props.userInfo} />
      <h2>{profileLink(props.userInfo)}</h2>
    </div>
  );
}

export function docTitle(title: string): string {
  return title && title.length > 0 ? title : "Untitled Notebook";
}

export function profileLink(
  u: types.UserInfo,
  text: string = null
): JSX.Element {
  const href = window.location.origin + "/notebook?profile=" + u.uid;
  return (
    <a class="profile-link" href={href}>
      {text ? text : u.displayName}
    </a>
  );
}
