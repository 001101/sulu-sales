<?php
/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */
namespace Sulu\Bundle\Sales\OrderBundle\Order;

use Doctrine\Common\Persistence\ObjectManager;
use Massive\Bundle\PdfBundle\Pdf\PdfManager;
use Sulu\Bundle\Sales\OrderBundle\Api\ApiOrderInterface;

class OrderPdfManager
{
    /**
     * @var PdfManager
     */
    protected $pdfManager;

    /**
     * @var string
     */
    protected $templateHeaderPath;

    /**
     * @var string
     */
    protected $templateFooterPath;

    /**
     * @var string
     */
    protected $templateBasePath;

    /**
     * @var string
     */
    protected $templateMacrosPath;

    /**
     * @var string
     */
    protected $templateConfirmationPath;

    /**
     * @var ObjectManager
     */
    protected $entityManager;

    /**
     * @var string
     */
    protected $websiteLocale;

    /**
     * @param ObjectManager $entityManager
     * @param PdfManager $pdfManager
     * @param string $templateConfirmationPath
     * @param string $templateBasePath
     * @param string $templateHeaderPath
     * @param string $templateFooterPath
     * @param string $templateMacrosPath
     * @param string $locale
     */
    public function __construct(
        ObjectManager $entityManager,
        PdfManager $pdfManager,
        $templateConfirmationPath,
        $templateBasePath,
        $templateHeaderPath,
        $templateFooterPath,
        $templateMacrosPath,
        $locale
    ) {
        $this->entityManager = $entityManager;
        $this->pdfManager = $pdfManager;
        $this->templateConfirmationPath = $templateConfirmationPath;
        $this->templateBasePath = $templateBasePath;
        $this->templateHeaderPath = $templateHeaderPath;
        $this->templateFooterPath = $templateFooterPath;
        $this->templateMacrosPath = $templateMacrosPath;
        $this->websiteLocale = $locale;
    }

    /**
     * @param ApiOrderInterface $order
     *
     * @return string
     */
    public function getPdfName($order)
    {
        $pdfName = 'PA_OrderConfirmation-' . $order->getNumber() . '.pdf';

        return $pdfName;
    }

    /**
     * @param ApiOrderInterface $apiOrder
     *
     * @return file
     */
    public function createOrderConfirmation(ApiOrderInterface $apiOrder)
    {
        $data = $this->getContentForPdf($apiOrder);

        $header = $this->pdfManager->renderTemplate(
            $this->templateHeaderPath,
            []
        );

        $footer = $this->pdfManager->renderTemplate(
            $this->templateFooterPath,
            []
        );

        $pdf = $this->pdfManager->convertToPdf(
            $this->templateConfirmationPath,
            $data,
            false,
            [
                'footer-html' => $footer,
                'header-html' => $header
            ]
        );

        return $pdf;
    }

    /**
     * Function that sets data array for pdf rendering.
     *
     * @param ApiOrderInterface $apiOrder
     *
     * @return array
     */
    protected function getContentForPdf(ApiOrderInterface $apiOrder)
    {
        $order = $apiOrder->getEntity();

        $customerNumber = null;
        if ($order->getCustomerAccount()) {
            $customerNumber = $order->getCustomerAccount()->getNumber();
        } else {
            $customerNumber = sprintf('%05d', $order->getCustomerContact()->getId());
        }

        $data = [
            'recipient' => $order->getDeliveryAddress(),
            'responsibleContact' => $order->getResponsibleContact(),
            'deliveryAddress' => $order->getDeliveryAddress(),
            'customerContact' => $order->getCustomerContact(),
            'billingAddress' => $order->getInvoiceAddress(),
            'order' => $order,
            'customerNumber' => $customerNumber,
            'orderApiEntity' => $apiOrder,
            'itemApiEntities' => $apiOrder->getItems(),
            'templateBasePath' => $this->templateBasePath,
            'templateMacrosPath' => $this->templateMacrosPath,
            'website_locale' => $this->websiteLocale,
        ];

        return $data;
    }
}
