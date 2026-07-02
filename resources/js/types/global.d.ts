/// <reference types="vite/client" />

import React from 'react';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    icon: string;
                    width?: string | number;
                    height?: string | number;
                    inline?: boolean;
                    class?: string;
                },
                HTMLElement
            >;
        }
    }
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    icon: string;
                    width?: string | number;
                    height?: string | number;
                    inline?: boolean;
                    class?: string;
                },
                HTMLElement
            >;
        }
    }
}
