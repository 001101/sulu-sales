<?php
/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\Sales\ShippingBundle\Controller;

use FOS\RestBundle\Routing\ClassResourceInterface;
use Hateoas\Representation\CollectionRepresentation;
use Sulu\Bundle\Sales\CoreBundle\Manager\LocaleManager;
use Sulu\Bundle\Sales\ShippingBundle\Api\Shipping;
use Sulu\Bundle\Sales\ShippingBundle\Entity\ShippingStatus;
use Sulu\Bundle\Sales\ShippingBundle\Shipping\Exception\MissingShippingAttributeException;
use Sulu\Bundle\Sales\ShippingBundle\Shipping\Exception\ShippingDependencyNotFoundException;
use Sulu\Bundle\Sales\ShippingBundle\Shipping\Exception\ShippingException;
use Sulu\Bundle\Sales\ShippingBundle\Shipping\Exception\ShippingNotFoundException;
use Sulu\Bundle\Sales\ShippingBundle\Shipping\ShippingManager;
use Sulu\Component\Rest\Exception\EntityNotFoundException;
use Sulu\Component\Rest\Exception\MissingArgumentException;
use Sulu\Component\Rest\Exception\RestException;
use Sulu\Component\Rest\ListBuilder\Doctrine\DoctrineListBuilderFactory;
use Sulu\Component\Rest\ListBuilder\Doctrine\DoctrineListBuilder;
use Sulu\Component\Rest\ListBuilder\Doctrine\FieldDescriptor\DoctrineFieldDescriptor;
use Sulu\Component\Rest\ListBuilder\Doctrine\FieldDescriptor\DoctrineJoinDescriptor;
use Sulu\Component\Rest\ListBuilder\ListRepresentation;
use Sulu\Component\Rest\RestController;
use Sulu\Component\Rest\RestHelperInterface;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Post;
use Sulu\Bundle\Sales\ShippingBundle\Entity\Shipping as ShippingEntity;

/**
 * Makes shippings available through a REST API
 *
 * @package Sulu\Bundle\Sales\OrderBundle\Controller
 */
class ShippingController extends RestController implements ClassResourceInterface
{

    protected static $shippingEntityName = 'SuluSalesShippingBundle:Shipping';
    protected static $orderEntityName = 'SuluSalesOrderBundle:Order';
    protected static $orderStatusEntityName = 'SuluSalesOrderBundle:OrderStatus';

    protected static $entityKey = 'shippings';

    /**
     * returns all fields that can be used by list
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function fieldsAction(Request $request)
    {
        $locale = $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale'));

        $context = $request->get('context');

        if ($context === 'order') {
            $descriptors = array_values($this->getManager()->getFieldDescriptors($locale, $context));
        } else {
            $descriptors = array_values($this->getManager()->getFieldDescriptors($locale));
        }

        // default contacts list
        return $this->handleView($this->view($descriptors), 200);
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function cgetAction(Request $request)
    {
        try {
            $filter = array();

            $locale = $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale'));

            $status = $request->get('status');
            $orderId = $request->get('orderId');
            if ($status) {
                $filter['status'] = $status;
            }
            if ($orderId) {
                $filter['orderId'] = $orderId;
            }

            if ($request->get('flat') == 'true') {
                /** @var RestHelperInterface $restHelper */
                $restHelper = $this->get('sulu_core.doctrine_rest_helper');

                /** @var DoctrineListBuilderFactory $factory */
                $factory = $this->get('sulu_core.doctrine_list_builder_factory');

                /** @var DoctrineListBuilder $listBuilder */
                $listBuilder = $factory->create(self::$shippingEntityName);

                $restHelper->initializeListBuilder($listBuilder, $this->getManager()->getFieldDescriptors($locale));

                foreach ($filter as $key => $value) {
                    $listBuilder->where($this->getManager()->getFieldDescriptor($key), $value);
                }

                $list = new ListRepresentation(
                    $listBuilder->execute(),
                    self::$entityKey,
                    'get_shippings',
                    $request->query->all(),
                    $listBuilder->getCurrentPage(),
                    $listBuilder->getLimit(),
                    $listBuilder->count()
                );
            } else {
                $list = new CollectionRepresentation(
                    $this->getManager()->findAllByLocale($this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale')), $filter),
                    self::$entityKey
                );
            }

            $view = $this->view($list, 200);
        } catch (ShippingException $ex) {
            $rex = new RestException($ex->getMessage());
            $view = $this->view($rex->toArray(), 400);
        }

        return $this->handleView($view);
    }

    /**
     * Retrieves and shows a shipping with the given ID
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param integer $id shipping ID
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getAction(Request $request, $id)
    {
        $locale = $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale'));
        $view = $this->responseGetById(
            $id,
            function ($id) use ($locale){
                /** @var Shipping $shipping */
                $shipping = $this->getManager()->findByIdAndLocale($id, $locale);

                return $shipping;
            }
        );

        return $this->handleView($view);
    }

    /**
     * this function returns number of shipped items per item
     * the result is a key value pair of itemId => number of shipped items
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function numberofshippedorderitemsAction(Request $request)
    {
        $orderId = $request->get('orderId');
        $sum = $this->getManager()->getSumOfShippedItemsByOrderId($orderId);
        return $this->handleView($this->view($sum, 200));
    }

    /**
     * Creates and stores a new shipping.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function postAction(Request $request)
    {
        try {
            $shipping = $this->getManager()->save(
                $request->request->all(),
                $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale')),
                $this->getUser()->getId()
            );

            $view = $this->view($shipping, 200);
        } catch (ShippingDependencyNotFoundException $exc) {
            $exception = new EntityNotFoundException($exc->getEntityName(), $exc->getId());
            $view = $this->view($exception->toArray(), 400);
        } catch (MissingShippingAttributeException $exc) {
            $exception = new MissingArgumentException(self::$shippingEntityName, $exc->getAttribute());
            $view = $this->view($exception->toArray(), 400);
        }

        return $this->handleView($view);
    }

    /**
     * Change a shipping.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param integer $id shipping ID
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function putAction(Request $request, $id)
    {
        try {
            $shipping = $this->getManager()->save(
                $request->request->all(),
                $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale')),
                $this->getUser()->getId(),
                $id
            );

            $view = $this->view($shipping, 200);
        } catch (ShippingNotFoundException $exc) {
            $exception = new EntityNotFoundException($exc->getEntityName(), $exc->getId());
            $view = $this->view($exception->toArray(), 404);
        } catch (ShippingDependencyNotFoundException $exc) {
            $exception = new EntityNotFoundException($exc->getEntityName(), $exc->getId());
            $view = $this->view($exception->toArray(), 400);
        } catch (MissingShippingAttributeException $exc) {
            $exception = new MissingArgumentException(self::$shippingEntityName, $exc->getAttribute());
            $view = $this->view($exception->toArray(), 400);
        } catch (ShippingException $exc) {
            $exception = new RestException($exc->getMessage());
            $view = $this->view($exception->toArray(), 400);
        }

        return $this->handleView($view);
    }

    /**
     * @Post("/shippings/{id}")
     */
    public function postTriggerAction($id, Request $request)
    {
        $status = $request->get('action');
        $em = $this->getDoctrine()->getManager();

        try {
            $shipping = $this->getManager()->findByIdAndLocale($id, $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale')));

            switch ($status) {
                case 'deliverynote':
                    $this->getManager()->convertStatus($shipping, ShippingStatus::STATUS_DELIVERY_NOTE);
                    break;
                case 'edit':
                    $this->getManager()->convertStatus($shipping, ShippingStatus::STATUS_CREATED);
                    break;
                case 'ship':
                    $this->getManager()->convertStatus($shipping, ShippingStatus::STATUS_SHIPPED);
                    break;
                case 'cancel':
                    $this->getManager()->convertStatus($shipping, ShippingStatus::STATUS_CANCELED);
                    break;
                default:
                    throw new RestException("Unrecognized status: " . $status);

            }

            $em->flush();
            $view = $this->view($shipping, 200);
        } catch (OrderNotFoundException $exc) {
            $exception = new EntityNotFoundException($exc->getEntityName(), $exc->getId());
            $view = $this->view($exception->toArray(), 404);
        }

        return $this->handleView($view);
    }

    /**
     * Delete a shipping with the given id.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param integer $id shipping ID
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request, $id)
    {
        $locale = $this->getLocaleManager()->retrieveLocale($this->getUser(), $request->get('locale'));

        $delete = function ($id) use ($locale){
            $this->getManager()->delete($id, $this->getUser()->getId());
        };
        $view = $this->responseDelete($id, $delete);

        return $this->handleView($view);
    }

    /**
     * @return ShippingManager
     */
    private function getManager()
    {
        return $this->get('sulu_sales_shipping.shipping_manager');
    }

    /**
     * @return LocaleManager
     */
    private function getLocaleManager()
    {
        return $this->get('sulu_sales_core.locale_manager');
    }

}
