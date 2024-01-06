import React, { TextareaHTMLAttributes } from 'react';
import styles from './style.module.css';

const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ ...rest }) => {
    return <textarea className={styles.area} {...rest} />;
}

export default Textarea;
