import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';

const Testing = () => {

  return (
    <></>
  );
};

export default Testing;


const subjLinks =
  [
    {
      subject: 'Biology',
      links: [
        {
          link: 'http://www.biologylink1.com',
          description: 'This is link 1'
        },
        {
          link: 'http://www.biologylink2.com',
          description: 'This is link 2'
        }
      ]
    },

    {
      subject: 'Physics',
      links: [
        {
          link: 'http://www.physicslink1.com',
          description: 'This is link 1'
        },
        {
          link: 'http://www.physicslink2.com',
          description: 'This is link 2'
        },
        {
          link: 'http://www.physicslink3.com',
          description: 'This is link 3'
        }
      ]
    },
    {
      subject: 'Mathematics',
      links: [
        {
          link: 'http://www.mathematicslink1.com',
          description: 'This is link 1'
        }
      ]
    },
  ]
