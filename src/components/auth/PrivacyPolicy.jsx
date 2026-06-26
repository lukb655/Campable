import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

export default function PrivacyPolicy({onClose}){
  return (
    <Modal title="Privacy Policy" onClose={onClose} wide>
      <div style={{fontSize:13,lineHeight:1.7,color:"var(--paper)"}}>
        <p style={{color:"var(--sage)",marginTop:0,fontSize:12}}>Last updated: June 2026 · Campable</p>
        <p><b>What we collect</b><br/>
        When you create an account we collect your name, email address, and password (hashed by Firebase Auth).
        When you use the app you may add photos, campsite coordinates, meal plans, and emergency contact details
        for trip planning purposes.</p>
        <p><b>How it's stored</b><br/>
        All data is stored in Google Firebase (Firestore and Firebase Auth).
        Photos are compressed and stored as data within your trip documents.
        No data is stored on Campable servers — Firebase is the sole data processor.</p>
        <p><b>Who can see your data</b><br/>
        Your trip data is visible to all members of that trip.
        Your name and email are used to identify you to your crew.
        Emergency contact details are shared with trip members only.</p>
        <p><b>What we don't do</b><br/>
        We do not sell, share, or monetise your personal data.
        We do not run ads. We do not use tracking or analytics beyond what Firebase provides by default.</p>
        <p><b>Your rights</b><br/>
        You can delete your account at any time from the Account screen.
        Deletion removes your Firebase Auth account and your profile data.
        Trip documents you were a member of may retain your name in historical records
        until those trips are deleted by their owner.</p>
        <p><b>Cookies & local storage</b><br/>
        The app uses browser localStorage only for session management (keeping you logged in).
        No third-party cookies are used.</p>
        <p><b>Contact</b><br/>
        Questions? Email <b>lukeb655@icloud.com</b></p>
      </div>
      <div style={St.modalActions}>
        <button style={St.primaryBtn} onClick={onClose}><Ic.check style={ic(15)}/> Got it</button>
      </div>
    </Modal>
  );
}
