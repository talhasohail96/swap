import React, { useState } from 'react';

const NewsletterBox = () => {
  const [submitted, setSubmitted] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    // Show confirmation
    setSubmitted(true);

    // Optionally reset after a few seconds
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
      <p className='text-gray-400 mt-3'>
        Stay in the loop and explore exclusive updates on our best-selling styles — join us today for free!
      </p>

      {submitted && (
        <p className="text-green-600 mt-3 font-medium">✅ Thank you for subscribing!</p>
      )}

      <form
        onSubmit={onSubmitHandler}
        className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'
      >
        <input
          className='w-full sm:flex-1 outline-none'
          type="email"
          placeholder='Enter your email'
          required
        />
        <button
          type='submit'
          className='bg-black text-white text-xs px-10 py-4'
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
